/*
 *
 * Rovuk A/P
 *
 * This component is used for change password.
 * User can change the password by clicking User icon on top left corner.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { httproutes, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { AuthService } from '../../superadmin/auth/services/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../components/map/mode-detect.service';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})

export class ChangepasswordComponent implements OnInit {

  change_password_form: any;
  Forcefull_Change_Password_Not_Matched: string = "";
  Forcefull_Change_Password_Reset: string = "";
  hideOld: boolean = true;
  hideNew: boolean = true;
  hideConfirm: boolean = true;
  subscription: Subscription;
  mode: any;

  eyeButtonForOldPassword() {
    this.hideOld = !this.hideOld;
  }

  eyeButtonForNewPassword() {
    this.hideNew = !this.hideNew;
  }

  eyeButtonForConfirmPassword() {
    this.hideConfirm = !this.hideConfirm;
  }

  /*
    constructor
  */
  constructor (private location: Location, private modeService: ModeDetectService, public authservice: AuthService, public httpCall: HttpCall,
    public snackbarservice: Snackbarservice, public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      let that = this;
      that.Forcefull_Change_Password_Not_Matched = that.translate.instant('Forcefull_Change_Password_Not_Matched');
      that.Forcefull_Change_Password_Reset = that.translate.instant('Forcefull_Change_Password_Reset');
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {

    } else {

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
      } else {
        this.mode = 'on';
      }
    });
  }

  ngOnInit(): void {
    this.change_password_form = new FormGroup({
      oldpassword: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      password_confirmation: new FormControl("", [Validators.required, this.passwordMatcher.bind(this)]),
    });
  }

  // confirm new password validator
  private passwordMatcher(control: FormControl): { [s: string]: boolean; } {
    if (this.change_password_form && (control.value !== this.change_password_form.controls.password.value)) {
      return { passwordNotMatch: true };
    } else {
      return null;
    }
  }

  /*
    Change password action
    API call and password changed for user in database.
  */
  changePasswordPress(): void {
    if (this.change_password_form.controls.password.value !== this.change_password_form.controls.password_confirmation.value) {
      this.snackbarservice.openSnackBar(this.Forcefull_Change_Password_Not_Matched, 'error');
      return;
    }
    if (this.change_password_form.valid) {
      const that = this;
      let url = "";
      let reqObject = that.change_password_form.value;
      let portal_type = sessionStorage.getItem(localstorageconstants.USERTYPE);
      if (portal_type == "superadmin") {
        reqObject.userrole = localStorage.getItem(localstorageconstants.USERROLE);
        url = httproutes.ADMIN_CHANGEPASSWORD;
      } else if (portal_type == "invoice-portal") {
        url = httproutes.EMPLOYEE_CHANGEPASSWORD;
      } else {
        return;
      }
      this.httpCall.httpPostCall(url, reqObject).subscribe(function (data) {
        if (data.status) {
          that.snackbarservice.openSnackBar(that.Forcefull_Change_Password_Reset, 'success');
          that.change_password_form.reset();
          that.location.back();
          Object.keys(that.change_password_form.controls).forEach(key => {
            that.change_password_form.get(key).setErrors(null);
          });
        } else {
          that.snackbarservice.openSnackBar(data.message, 'error');
        }
      });
    }
  }
}
