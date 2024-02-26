import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { checkPermissionAfterLogin, showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { AuthService } from 'src/app/core/service/auth.service';
import { AuthenticationService } from '../authentication.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
@Component({
  selector: 'app-send-otp',
  templateUrl: './send-otp.component.html',
  styleUrls: ['./send-otp.component.scss']
})
export class SendOtpComponent {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  companyCode = '';
  sentOTP = false;
  otp = "";
  otpTimer: any;
  otpConfig: any = {
    length: 6,
    allowNumbersOnly: false,
    letterCase: 'Upper'
  };
  companyList: any = [];
  useremail = '';
  showCompanyList = false;
  removable = true;

  constructor (
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
  ) {
    this.companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE) ?? '';
    this.authForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
    });
  }

  get f() {
    return this.authForm.controls;
  }
  onOtpChange(event: any) {
    this.otp = event;
  }

  async sendOTP() {
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.SEND_OTP_EMAIL, reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.sentOTP = true;
        // for delete we use splice in order to remove single object from DataService 
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async submitOTP() {
    let that = this;
    if (that.authForm.valid) {
      const reqObject = this.authForm.value;
      reqObject.companycode = this.companyCode;
      reqObject.otp = this.otp;
      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.SUBMITT_OTP, reqObject);
      if (data.status) {
        if (data.data.length === 0) {
          showNotification(that.snackBar, 'You are not associated with any company. Kindly contact superadmin.', 'error');
        } else if (data.data.length === 1) {
          // only one compant so direct login
          showNotification(that.snackBar, data.message, 'success');
          that.authenticationService.changeTokenValue(data.user_data.token);
          localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
          localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
          localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);
          localStorage.setItem(localstorageconstants.LOGOUT, 'false');
          localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
          sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');

          if (data.user_data.UserData.useris_password_temp == true) {
            that.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
          } else {
            that.authenticationService.changeLoginValue(false);
            localStorage.setItem(localstorageconstants.LOGOUT, 'false');
            setTimeout(() => {
              that.router.navigate([checkPermissionAfterLogin(data.user_data.role_permission)]);
              location.reload();
            }, 500);
          }
        } else {
          that.useremail = reqObject.useremail;
          that.companyList = data.data;
          that.showCompanyList = true;
        }
        // for delete we use splice in order to remove single object from DataService
      } else {
        showNotification(that.snackBar, data.message, 'error');
      }
    }
  }

  async selectCompany(company: any) {
    const formValues = this.authForm.value;
    formValues._id = company._id;
    const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.LOGIN_WITH_OTP, formValues);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.authenticationService.changeTokenValue(data.user_data.token);
      localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
      localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
      localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);
      localStorage.setItem(localstorageconstants.LOGOUT, 'false');
      localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');

      if (data.user_data.UserData.useris_password_temp == true) {
        this.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
      } else {
        this.authenticationService.changeLoginValue(false);
        localStorage.setItem(localstorageconstants.LOGOUT, 'false');
        setTimeout(() => {
          this.router.navigate([checkPermissionAfterLogin(data.user_data.role_permission)]);
          location.reload();
        }, 500);
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  removeUseremail() {
    this.router.navigate([WEB_ROUTES.LOGIN]);
  }

  openLogin() {
    this.router.navigate([WEB_ROUTES.LOGIN]);
  }
}