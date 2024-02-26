import { AuthService } from 'src/app/core/service/auth.service';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { checkPermissionAfterLogin, showNotification } from 'src/consts/utils';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { Theme } from '@fullcalendar/core/internal';
import { DOCUMENT } from '@angular/common';
import { InConfiguration } from 'src/app/core/models/config.interface';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CompanyModel } from 'src/consts/common.model';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
export interface ChipColor {
  name: string;
  color: string;
}

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  returnUrl!: string;
  error = '';
  hide = true;
  removable = true;
  showLogin = true;
  companyCode!: string;
  useremail!: string;
  checked = false;

  availableColors: ChipColor[] = [
    { name: 'none', color: '' },
    { name: 'Primary', color: 'primary' },
    { name: 'Accent', color: 'accent' },
    { name: 'Warn', color: 'warn' },
  ];
  showForm = false;
  companyList: Array<CompanyModel> = [];

  constructor(private formBuilder: UntypedFormBuilder, private router: Router, private authService: AuthService,
    private AuthenticationService: AuthenticationService, private snackBar: MatSnackBar, public uiSpinner: UiSpinnerService,
    private renderer: Renderer2, @Inject(DOCUMENT) private document: Document, private commonService: CommonService,
  ) {
    //localStorage.setItem(localstorageconstants.DARKMODE, 'dark');
    setTimeout(() => {
      this.showForm = true;
    }, 100);
  }
  ngOnInit() {

    this.authForm = this.formBuilder.group({
      useremail: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // companycode: ['', Validators.required],
      terms: ['', Validators.required],
    });

    this.companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE)!;
    if (this.companyCode != null) {
      const removeFirst2 = this.companyCode.slice(2);
      this.showLogin = true;
      this.authForm = this.formBuilder.group({
        useremail: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        // companycode: [removeFirst2, Validators.required],
        terms: ['', Validators.required],
      });
    }
    this.lightThemeBtnClick();

    // if (
    //   window.matchMedia &&
    //   window.matchMedia('(prefers-color-scheme: dark)').matches
    // ) {
    //   // dark mode
    //   this.darkThemeBtnClick();
    // } else {
    //   //Light mode
    //   this.lightThemeBtnClick();
    // }
  }
  get f() {
    return this.authForm.controls;
  }
  showLoginForm() {
    this.getCompanySettings();
  }
  goResetPasswordForm() {
    this.router.navigate([WEB_ROUTES.FORGOT_PASSWORD]);
  }
  goSendOtpForm() {
    this.router.navigate([WEB_ROUTES.SEND_OTP]);
  }
  public removeCompanyCode() {
    this.companyCode = '';
    this.showLogin = false;
    localStorage.removeItem(localstorageconstants.COMPANYCODE);
    this.authForm.reset();
  }
  langurl() {
    window.open('https://smartaccupay.com/mobile-terms-of-service/', '_blank');
  }
  public onSaveUsernameChanged(value: boolean) {
    this.checked = value;
  }

  async getCompanySettings() {
    const formValues = this.authForm.value;
    // this.companyCode = 'R-' + formValues.companycode;
    const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.GET_COMPANY_SETTINGS, { companycode: this.companyCode });
    if (data.status) {
      this.showLogin = true;
      localStorage.setItem(localstorageconstants.COMPANYCODE, this.companyCode);
    }
  }
  async userLogin() {
    if (!this.checked) {
      showNotification(this.snackBar, 'Please agree terms & conditions before proceed.', 'error');
      return;
    }
    const formValues = this.authForm.value;
    this.uiSpinner.spin$.next(true);
    // formValues.companycode = 'R-' + formValues.companycode;
    const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.GET_USER_COMPANY, formValues);
    if (data.status) {
      this.uiSpinner.spin$.next(false);
      if (data.data.length === 0) {
        showNotification(this.snackBar, 'Invalid email or password!', 'error');
      } else if (data.data.length === 1) {
        // only one compant so direct login
        showNotification(this.snackBar, data.message, 'success');
        if (data.user_data.UserData.useris_password_temp == true) {
          this.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
        } else {
          this.AuthenticationService.changeLoginValue(false);
          localStorage.setItem(localstorageconstants.LOGOUT, 'false');
          setTimeout(() => {
            this.router.navigate([checkPermissionAfterLogin(data.user_data.role_permission)]);
            location.reload();
          }, 500);
        }
        this.AuthenticationService.changeTokenValue(data.user_data.token);
        localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.user_data.token);
        localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.user_data));
        localStorage.setItem(localstorageconstants.COMPANYID, data.user_data.companydata._id);

        sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
        localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      } else {
        this.useremail = formValues.useremail;
        this.companyList = data.data;
        this.showLogin = false;
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(this.document.body, localStorage.getItem('choose_skin') as string);
    } else {
      this.renderer.removeClass(this.document.body, 'theme-dark');
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'theme-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    // this.selectedBgColor = 'white';
    // this.isDarkSidebar = false;
    localStorage.setItem('choose_logoheader', 'logo-white');
    localStorage.setItem('choose_skin', 'theme-white');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
  }

  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(this.document.body, localStorage.getItem('choose_skin') as string);
    } else {
      this.renderer.removeClass(this.document.body, 'theme-light');
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'theme-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    // this.selectedBgColor = 'black';
    // this.isDarkSidebar = true;
    localStorage.setItem('choose_logoheader', 'logo-black');
    localStorage.setItem('choose_skin', 'theme-black');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
  }

  removeUseremail() {
    this.useremail = '';
    this.showLogin = true;
    this.authForm.reset();
  }

  async selectCompany(company: CompanyModel) {
    const formValues = this.authForm.value;
    formValues.companycode = company.companycode;
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.USER_LOGIN, formValues);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      if (data.data.UserData.useris_password_temp == true) {
        this.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
      } else {
        this.AuthenticationService.changeLoginValue(false);
        localStorage.setItem(localstorageconstants.LOGOUT, 'false');
        setTimeout(() => {
          this.router.navigate([checkPermissionAfterLogin(data.data.role_permission)]);
          location.reload();
        }, 500);
      }
      this.AuthenticationService.changeTokenValue(data.data.token);
      localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
      localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
      localStorage.setItem(localstorageconstants.COMPANYID, data.data.companydata._id);

      sessionStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
      localStorage.setItem(localstorageconstants.USERTYPE, 'invoice-portal');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }
}
