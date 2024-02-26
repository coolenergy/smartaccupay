import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { icon } from 'src/consts/icon';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../../authentication/authentication.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { AuthService } from 'src/app/core/service/auth.service';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UserDataModel } from 'src/consts/common.model';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-locked',
  templateUrl: './locked.component.html',
  styleUrls: ['./locked.component.scss'],
})
export class LockedComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  returnUrl!: string;
  hide = true;
  userData!: UserDataModel;
  userName = '';
  userPicture: string = icon.MALE_PLACEHOLDER;

  constructor (private formBuilder: UntypedFormBuilder, private router: Router, private snackBar: MatSnackBar,
    private authenticationService: AuthenticationService, private authService: AuthService, private commonService: CommonService,) {
    const user_data = localStorage.getItem(localstorageconstants.USERDATA) ?? '';
    if (user_data !== '') {
      this.userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');
      this.userName = this.userData.UserData.userfullname;
      this.userPicture = this.userData.UserData.userpicture;
    }
  }

  ngOnInit() {
    this.authForm = this.formBuilder.group({
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.authForm.controls;
  }

  async onSubmit() {
    this.submitted = true;
    // stop here if form is invalid
    if (this.authForm.invalid) {
      return;
    } else {
      const formValues = this.authForm.value;
      const requestObject = {
        useremail: this.userData.UserData.useremail,
        password: formValues.password,
        companycode: this.userData.companydata.companycode,
      };
      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.USER_LOGIN, requestObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        if (data.data.UserData.useris_password_temp == true) {
          this.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
        } else {
          setTimeout(() => {
            this.router.navigate([WEB_ROUTES.DASHBOARD]);
          }, 300);
        }
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  backToLogin() {
    this.authenticationService.changeLoginValue(true);
    localStorage.removeItem(localstorageconstants.DARKMODE);
    localStorage.removeItem(localstorageconstants.USERDATA);
    localStorage.removeItem(localstorageconstants.COMPANYDATA);
    localStorage.removeItem(localstorageconstants.COMPANYID);
    localStorage.removeItem(localstorageconstants.INVOICE_GIF);
    localStorage.removeItem(localstorageconstants.INVOICE_TOKEN);
    localStorage.setItem(localstorageconstants.LOGOUT, 'true');
    localStorage.removeItem('choose_logoheader');
    localStorage.removeItem('choose_skin');
    localStorage.removeItem('menuOption');
    localStorage.removeItem('thinvoicetheme');
    setTimeout(() => {
      this.router.navigate([WEB_ROUTES.LOGIN]);
      location.reload();
    }, 500);
  }
}
