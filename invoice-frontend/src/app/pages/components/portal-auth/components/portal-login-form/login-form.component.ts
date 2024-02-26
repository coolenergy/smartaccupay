import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Snackbarservice } from '../../../../../service/snack-bar-service';
import { PortalAuthService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { httproutes, localstorageconstants, routes } from '../../../../../consts';
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { checkRoutePermission, longDate } from 'src/app/service/utils';
import { DeviceDetectorService } from 'ngx-device-detector';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { CurrencyPipe } from '@angular/common';
import { configdata } from 'src/environments/configData';
import { AppComponent } from 'src/app/app.component';
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})

export class PortalLoginFormComponent implements OnInit {
  @Output() sendLoginForm = new EventEmitter<void>();
  public checked: boolean = false;
  public form: any;
  public routers: typeof routes = routes;
  deviceInfo: any;
  lookupInfo: any;
  returnUrl: any;
  Login_Form_Please_Agree: string = "";
  Login_Form_Login_Successfully: string = "";
  Login_Form_Login_Success_Reset_Password: string = "";
  check_curr: any;
  hide: boolean = true;

  eyeButtonForPassword() {
    this.hide = !this.hide;
  }

  constructor(private deviceService: DeviceDetectorService, private metaService: Meta, public myapp: AppComponent, private titleService: Title,
    public translate: TranslateService, public authservice: PortalAuthService, private router: Router,
    public httpCall: HttpCall, private currencyPipe: CurrencyPipe,
    private route: ActivatedRoute, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    this.translate.stream(['']).subscribe((textarray) => {
      let that = this;
      that.Login_Form_Please_Agree = that.translate.instant('Login_Form_Please_Agree');
      that.Login_Form_Login_Successfully = that.translate.instant('Login_Form_Login_Successfully');
      that.Login_Form_Login_Success_Reset_Password = that.translate.instant('Login_Form_Login_Success_Reset_Password');
    });
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(locallanguage);
    this.epicFunction();
  }

  public onSaveUsernameChanged(value: boolean) {
    this.checked = value;
  }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }


  public ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    this.titleService.setTitle('Rovuk A/P');
    this.metaService.addTags([
      { name: 'Rovuk A/P', content: 'Rovuk A/P' },
      { name: 'a construction application', content: 'Rovuk A/P' },
    ]);
    this.form = new FormGroup({
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required]),
      terms: new FormControl("", [Validators.required])
    });
  }

  public login(): void {
    if (!this.checked) {
      this.snackbarservice.openSnackBar(this.Login_Form_Please_Agree, 'error');
      return;
    }



    if (this.form.valid) {
      this.uiSpinner.spin$.next(true);
      let reqObject = {
        useremail: this.form.value.email,
        password: this.form.value.password,
        companycode: localStorage.getItem(localstorageconstants.COMPANYCODE),
      };
      const that = this;
      this.authservice.login(reqObject).subscribe(function (data) {
        if (data.status) {
          localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
          localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
          localStorage.setItem(localstorageconstants.SUPPLIERID, data.data.companydata._id);
          localStorage.setItem(localstorageconstants.LOGOUT, 'false');

          sessionStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
          localStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
          that.myapp.updateIdealTimeout();

          that.uiSpinner.spin$.next(false);
          if (that.returnUrl == null) {

            if (data.data.UserData.useris_password_temp == false) {
              if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData); }
              that.snackbarservice.openSnackBar(that.Login_Form_Login_Successfully, 'success');
              //that.router.navigate(['/dashboard']).then();
              that.router.navigate([checkRoutePermission(data.data.role_permission)]).then();
            }
            else {
              if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData); }
              that.snackbarservice.openSnackBar(that.Login_Form_Login_Success_Reset_Password, 'success');
              that.router.navigateByUrl('/forcefully-changepassword');
            }

          } else {
            let url_array = that.returnUrl.split('?');
            let queryParams_tmp = url_array[1];
            let query_params: any = {};
            if (queryParams_tmp != null || queryParams_tmp != undefined) {
              let queryParams_array: any = queryParams_tmp.split('&');
              for (let m = 0; m < queryParams_array.length; m++) {
                let tmp_one_query = queryParams_array[m].split('=');
                query_params[tmp_one_query[0]] = decodeURIComponent(tmp_one_query[1]);
              }
            }
            if (data.data.UserData.useris_password_temp == false) {
              if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData); }
              that.snackbarservice.openSnackBar(that.Login_Form_Login_Successfully, 'success');
              that.router.navigate([url_array[0]], { queryParams: query_params });
            }
            else {
              if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData); }
              that.snackbarservice.openSnackBar(that.Login_Form_Login_Success_Reset_Password, 'success');
              that.router.navigateByUrl('/forcefully-changepassword');
            }
          }
        } else {
          that.snackbarservice.openSnackBar(data.message, 'error');
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }
  loginHistory(userdata: any) {
    let that = this;
    fetch("https://ipinfo.io/json?token=a0faf8805063c2")
      .then(res => res.json())
      .then(response => {
        this.lookupInfo = response;
        let loc = this.lookupInfo['loc'];
        let let_log = loc.split(',');
        let new_reqObject = {
          user_id: userdata._id,
          created_date: longDate(new Date()),
          ip_address: this.lookupInfo['ip'],
          mac_address: "",
          device_type: "Web",
          device_name: this.deviceInfo['device'] + " " + this.deviceInfo['deviceType'],
          os: this.deviceInfo['os'],
          os_version: this.deviceInfo['os_version'],
          browser: this.deviceInfo['browser'],
          browser_version: this.deviceInfo['browser_version'],
          location: this.lookupInfo['city'] + ", " + this.lookupInfo['country'] + ", " + this.lookupInfo['postal'],
          location_lat: let_log[0],
          location_lng: let_log[1],
          companycode: localStorage.getItem(localstorageconstants.COMPANYCODE),
        };
        that.httpCall.httpPostCall(httproutes.USER_LOGIN_HISTORY, new_reqObject).subscribe(function (params: any) {

        });
      })
      .catch((data) => {
      });
  }
  langurl() {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    if (portal_language == 'en') {
      window.open('https://smartaccupay.com/mobile-terms-of-service/', '_blank');
    } else if (portal_language == 'es') {
      window.open('https://smartaccupay.com/mobile-terms-of-service/', '_blank');
    } else {
      window.open('https://smartaccupay.com/mobile-terms-of-service/', '_blank');
    }
  }

  somethingChanged(element: any) {
    if (typeof element == "string") {
      let tmp_formant = element;
      let split_string = tmp_formant.split(".");
      let find_number_only = split_string[0].replace(/[^0-9 ]/g, "");
      this.check_curr = this.currencyPipe.transform(find_number_only, '$');
      let tmp_solit = this.check_curr.split(".");
      if (split_string[1]) {
        tmp_solit[1] = split_string[1];
      }
      this.check_curr = tmp_solit.join(".");
    }
  }
}
