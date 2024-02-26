import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { httproutes, localstorageconstants, routes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/pages/superadmin/auth/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forcefull-change-password',
  templateUrl: './forcefull-change-password.component.html',
  styleUrls: ['./forcefull-change-password.component.scss']
})
export class ForcefullChangePasswordComponent implements OnInit {
  Forcefull_Change_Password_Not_Matched: string = "";
  Forcefull_Change_Password_Reset: string = "";
  public change_password_form: any;
  public routers: typeof routes = routes;
  hideOld: boolean = true;
  hideNew: boolean = true;
  hideConfirm: boolean = true;

  eyeButtonForOldPassword() {
    this.hideOld = !this.hideOld;
  }

  eyeButtonForNewPassword() {
    this.hideNew = !this.hideNew;
  }

  eyeButtonForConfirmPassword() {
    this.hideConfirm = !this.hideConfirm;
  }
  constructor (private location: Location, public authservice: AuthService, private router: Router,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public route: ActivatedRoute, public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      let that = this;
      that.Forcefull_Change_Password_Not_Matched = that.translate.instant('Forcefull_Change_Password_Not_Matched');
      that.Forcefull_Change_Password_Reset = that.translate.instant('Forcefull_Change_Password_Reset');
    });
  }

  ngOnInit(): void {
    this.change_password_form = new FormGroup({
      oldpassword: new FormControl("", [Validators.required]),
      password: new FormControl("", [Validators.required]),
      password_confirmation: new FormControl("", [Validators.required, this.passwordMatcher.bind(this)]),
    });

    let useris_password_temp = this.route.snapshot.queryParamMap.get('useris_password_temp');
    if (useris_password_temp) {
    }
    else {
    }

  }

  // confirm new password validator
  private passwordMatcher(control: FormControl): { [s: string]: boolean; } {
    if (this.change_password_form && (control.value !== this.change_password_form.controls.password.value)) {
      return { passwordNotMatch: true };
    } else {
      return null;
    }
  }

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
          let role_permission_front = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
          that.router.navigate(['/dashboard']).then();
          //that.router.navigate([checkRoutePermission(role_permission_front)]).then();
          // that.location.back();
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
