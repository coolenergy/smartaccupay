import { Component } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';
import { AuthenticationService } from '../authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/services/common.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { checkPermissionAfterLogin, showNotification } from 'src/consts/utils';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  changePasswordInfo!: UntypedFormGroup;
  hide = true;
  hideOld = true;
  hideNew = true;
  hideConfirm = true;
  eyeButtonForOldPassword() {
    this.hideOld = !this.hideOld;
  }
  logo = icon.INVOICE_LOGO;
  eyeButtonForNewPassword() {
    this.hideNew = !this.hideNew;
  }

  eyeButtonForConfirmPassword() {
    this.hideConfirm = !this.hideConfirm;
  }

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    private commonService: CommonService,
  ) {
    this.initForm();
  }

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }

  initForm() {
    this.changePasswordInfo = this.fb.group(
      {
        oldpassword: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
        password_confirmation: new FormControl('', [Validators.required]),
      },
      {
        validator: this.ConfirmedValidator('password', 'password_confirmation'),
      }
    );
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmedValidator: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }
  private passwordMatcher(control: FormControl): { [s: string]: boolean; } {
    console.log('cantrol', control.value);
    console.log(
      'forcefully',
      this.changePasswordInfo?.controls['password'].value
    );
    if (
      this.changePasswordInfo &&
      control.value !== this.changePasswordInfo?.controls['password'].value
    ) {
      return { passwordNotMatch: true };
    } else {
      return { passwordNotMatch: false };
    }
  }

  async changePassword() {
    this.changePasswordInfo?.markAllAsTouched();
    const reqObject = this.changePasswordInfo?.value;
    let that = this;
    if (reqObject.password !== reqObject.password_confirmation) {
      showNotification(
        this.snackBar,
        'Password and confirm password is not matched',
        'error'
      );
      return;
    }
    // console.log("call change passwoed", that.changePasswordInfo?.valid, that.changePasswordInfo?.value);
    if (that.changePasswordInfo?.valid) {
      this.uiSpinner.spin$.next(true);
      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.CHANGEPASSWORD, reqObject);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        const role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
        this.router.navigate([checkPermissionAfterLogin(role_permission)]);
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }
  onRegister() {
    console.log('Form Value', this.changePasswordInfo?.value);
  }
}
