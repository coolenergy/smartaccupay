import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PortalAuthService } from '../../services';
import { httproutes, localstorageconstants, routes } from '../../../../../consts';
import { TranslateService } from '@ngx-translate/core';
import { Snackbarservice } from '../../../../../service/snack-bar-service';
import { configdata } from 'src/environments/configData';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { Subscription, timer } from 'rxjs';
import { checkRoutePermission, longDate } from 'src/app/service/utils';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent implements OnInit {
  public todayDate: Date = new Date();
  public routers: typeof routes = routes;

  public c_code: string | null = "";
  public form!: FormGroup;
  public forgotpassword_form!: FormGroup;
  public otp_form!: FormGroup;
  public showCompanyCode: Boolean = true;
  public showLogin: Boolean = false;
  public showForgotPassword: Boolean = false;
  public showOTP: Boolean = false;
  public sentOTP: Boolean = false;

  removable = true;
  public roles: any = configdata.superAdminRole;
  Auth_Page_Reset_Successfully: string = "";

  showOTPOption: boolean = false;
  otp: string = "";
  otpConfig = {
    length: 6,
    allowNumbersOnly: false,
    letterCase: 'Upper'
  };
  otpTimer: any;
  subscription!: Subscription;

  constructor (public httpCall: HttpCall, private service: PortalAuthService, private router: Router,
    public myapp: AppComponent, public uiSpinner: UiSpinnerService,
    public translate: TranslateService, public authservice: PortalAuthService, public snackbarservice: Snackbarservice) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Auth_Page_Reset_Successfully = this.translate.instant('Auth_Page_Reset_Successfully');
    });
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(locallanguage);
    if (localStorage.getItem(localstorageconstants.COMPANYCODE)) {
      let that = this;
      that.c_code = localStorage.getItem(localstorageconstants.COMPANYCODE);
      that.httpCall.httpPostCallWithoutToken(httproutes.GET_COMPANY_SETTINGS, { companycode: this.c_code }).subscribe((params) => {
        let temp_show = false;
        if (params.status) {
          let otp_setting = params.data.Enable_OTP;
          if (otp_setting.setting_status == 'Active' && otp_setting.setting_value == 'Yes') {
            temp_show = true;
          }
        }
        setTimeout(() => {
          that.showOTPOption = temp_show;
          that.showCompanyCode = false;
          that.showLogin = true;
          that.showForgotPassword = false;
          that.showOTP = false;
        }, 100);
      });
    }

  }

  public ngOnInit(): void {
    this.form = new FormGroup({
      companycode: new FormControl("", [Validators.required])
    });

    this.forgotpassword_form = new FormGroup({
      useremail: new FormControl("", [Validators.required, Validators.email]),
      userole: new FormControl(1, [Validators.required])
    });

    this.otp_form = new FormGroup({
      useremail: new FormControl("", [Validators.required, Validators.email]),
    });
  }

  public sendSignForm(): void {
    this.service.sign();
    this.router.navigate([this.routers.DASHBOARD]).then();
  }

  public savecompnaycode(): void {
    let that = this;
    if (that.form.valid) {
      that.httpCall.httpPostCallWithoutToken(httproutes.GET_COMPANY_SETTINGS, { companycode: "R-" + that.form.value.companycode }).subscribe((params) => {
        let temp_show = false;
        if (params.status) {
          let otp_setting = params.data.Enable_OTP;
          if (otp_setting.setting_status == 'Active' && otp_setting.setting_value == 'Yes') {
            temp_show = true;
          }
        }
        setTimeout(() => {
          that.showOTPOption = temp_show;
          localStorage.setItem(localstorageconstants.COMPANYCODE, "R-" + that.form.value.companycode);
          that.showCompanyCode = false;
          that.showLogin = true;
          that.showForgotPassword = false;
          that.showOTP = false;
          that.c_code = localStorage.getItem(localstorageconstants.COMPANYCODE);
        }, 100);
      });
    }
  }

  public removacode() {
    localStorage.removeItem(localstorageconstants.COMPANYCODE);
    this.showCompanyCode = true;
    this.showLogin = false;
    this.showForgotPassword = false;
    this.showOTP = false;
    this.showOTPOption = false;
  }

  public forgotPasswordPress(): void {
    if (this.forgotpassword_form.valid) {
      let reqObject = {
        useremail: this.forgotpassword_form.value.useremail,
        companycode: localStorage.getItem(localstorageconstants.COMPANYCODE)
      };
      const that = this;
      that.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCallWithoutToken(httproutes.USER_FORGET_PASSWORD, reqObject).subscribe((params) => {
        if (params.status) {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, 'success');
          that.showCompanyCode = false;
          that.showLogin = true;
          that.showForgotPassword = false;
          that.showOTP = false;
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, 'error');
        }
      });
    }
  }

  public openForgotPasswordPress(): void {
    this.showCompanyCode = false;
    this.showLogin = false;
    this.showForgotPassword = true;
    this.showOTP = false;
  }

  public resetForgotPasswordPress(): void {
    this.showCompanyCode = false;
    this.showLogin = true;
    this.showForgotPassword = false;
    this.showOTP = false;
  }

  openOTPScreen() {
    this.showCompanyCode = false;
    this.showLogin = false;
    this.showForgotPassword = false;
    this.showOTP = true;
  }

  onOtpChange(event: any) {
    this.otp = event;
  }

  sendOTP() {
    let that = this;
    if (that.otp_form.valid) {
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCallWithoutToken(httproutes.SEND_SUPPLIER_OTP_EMAIL, { companycode: that.c_code, useremail: that.otp_form.value.useremail }).subscribe((params) => {
        if (params.status) {
          that.uiSpinner.spin$.next(false);
          that.sentOTP = true;
          that.snackbarservice.openSnackBar(params.message, 'success');
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, 'error');
        }
      });
    }
  }

  startTimer() {
    let that = this;
    let source = timer(0, 1000);
    this.subscription = source.subscribe(val => {
      if (that.otpTimer == 0) {
        this.subscription.unsubscribe();
      } else {
        that.otpTimer = that.otpTimer - 1;
      }
    });
  }

  displayTime() {
    let minutes = 0;
    let seconds = 0;
    minutes = Math.round(this.otpTimer / 60);
    seconds = this.otpTimer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  submitOTP() {
    let that = this;
    if (that.otp_form.valid) {
      if (that.otp.length != 6) {
        that.snackbarservice.openSnackBar('Please enter 6 digit of One Time Password (OTP).', 'error');
      } else {
        that.uiSpinner.spin$.next(true);
        that.httpCall.httpPostCallWithoutToken(httproutes.SUBMITT_SUPPLIER_OTP, { companycode: that.c_code, useremail: that.otp_form.value.useremail, otp: that.otp }).subscribe((params) => {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, 'success');
            localStorage.setItem(localstorageconstants.INVOICE_TOKEN, params.data.token);
            localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(params.data));
            localStorage.setItem(localstorageconstants.SUPPLIERID, params.data.companydata._id);
            sessionStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
            localStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");


            localStorage.setItem(localstorageconstants.LOGOUT, 'false');
            that.myapp.updateIdealTimeout();

            if (params.data.UserData.role_name != configdata.EMPLOYEE) {
              that.loginHistory(params.data.UserData);
            }
            // that.snackbarservice.openSnackBar(that.Login_Form_Login_Successfully, 'success'); 
            that.router.navigate([checkRoutePermission(params.data.role_permission)]).then();
          } else {
            that.uiSpinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, 'error');
          }
        });
      }
    }
  }

  loginHistory(userdata: any) {
    let lookupInfo: any;
    let deviceInfo: any;
    let that = this;
    fetch("https://ipinfo.io/json?token=a0faf8805063c2")
      .then(res => res.json())
      .then(response => {

        lookupInfo = response;
        let loc = lookupInfo['loc'];
        let let_log = loc.split(',');
        let new_reqObject = {
          user_id: userdata._id,
          created_date: longDate(new Date()),
          ip_address: lookupInfo['ip'],
          mac_address: "",
          device_type: "Web",
          device_name: deviceInfo['device'] + " " + deviceInfo['deviceType'],
          os: deviceInfo['os'],
          os_version: deviceInfo['os_version'],
          browser: deviceInfo['browser'],
          browser_version: deviceInfo['browser_version'],
          location: lookupInfo['city'] + ", " + lookupInfo['country'] + ", " + lookupInfo['postal'],
          location_lat: let_log[0],
          location_lng: let_log[1],
          companycode: localStorage.getItem(localstorageconstants.COMPANYCODE),
        };
        that.httpCall.httpPostCall(httproutes.USER_LOGIN_HISTORY, new_reqObject).subscribe(function (params: any) { });
      })
      .catch((data) => {
      });
  }

  openLoginScreen() {
    this.showCompanyCode = false;
    this.showLogin = true;
    this.showForgotPassword = false;
    this.showOTP = false;
  }
}
