import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UserService } from 'src/app/users/user.service';
import { RolePermission } from 'src/consts/common.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';

@Component({
  selector: 'app-add-user-emergenct-contact',
  templateUrl: './add-user-emergenct-contact.component.html',
  styleUrls: ['./add-user-emergenct-contact.component.scss']
})
export class AddUserEmergenctContactComponent implements OnInit {
  form!: UntypedFormGroup;
  id: any;
  userId: any;
  role_permission!: RolePermission;

  variablesRelationshipList: any = [];
  relationshipList: any = this.variablesRelationshipList.slice();

  constructor (public uiSpinner: UiSpinnerService, public userService: UserService, private fb: UntypedFormBuilder,
    public route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar,
    public translate: TranslateService, private commonService: CommonService) {
    this.id = this.route.snapshot.queryParamMap.get("_id");
    this.userId = this.route.snapshot.queryParamMap.get("user_id");
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;

    this.form = this.formBuilder.group({
      emergency_contact_name: ["", Validators.required],
      emergency_contact_relation: ["", Validators.required],
      emergency_contact_phone: ["", Validators.required],
      emergency_contact_email: ["", [Validators.email, Validators.required]],
      emergency_contact_fulladdress: [""],
      emergency_contact_street1: [""],
      emergency_contact_street2: [""],
      emergency_contact_city: [""],
      emergency_contact_state: [""],
      emergency_contact_zipcode: [""],
      emergency_contact_country: [""],
    });
    if (this.id) {
      this.getOneEmergencyContact();
    }
  }

  ngOnInit() {
    this.getRelationship();
  }

  async getOneEmergencyContact() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_EMERGENCY_CONTACT, { _id: this.id });
    this.form = this.formBuilder.group({
      emergency_contact_name: [data.data.emergency_contact_name, Validators.required],
      emergency_contact_relation: [data.data.emergency_contact_relation, Validators.required],
      emergency_contact_phone: [data.data.emergency_contact_phone, Validators.required],
      emergency_contact_email: [data.data.emergency_contact_email, [Validators.email, Validators.required]],
      emergency_contact_fulladdress: [data.data.emergency_contact_fulladdress],
      emergency_contact_street1: [data.data.emergency_contact_street1],
      emergency_contact_street2: [data.data.emergency_contact_street2],
      emergency_contact_city: [data.data.emergency_contact_city],
      emergency_contact_state: [data.data.emergency_contact_state],
      emergency_contact_zipcode: [data.data.emergency_contact_zipcode],
      emergency_contact_country: [data.data.emergency_contact_country],
    });
  }

  async getRelationship() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_RELATIONSHIP);
    if (data.status) {
      this.variablesRelationshipList = data.data;
      this.relationshipList = this.variablesRelationshipList.slice();
    }
  }

  async saveEmergencyContact() {
    if (this.form.valid) {
      const reqObject = this.form.value;
      if (this.id) {
        reqObject._id = this.id;
      }
      reqObject.emergency_contact_userid = this.userId;
      this.uiSpinner.spin$.next(true);
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_EMERGENCY_CONTACT, reqObject);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
        this.uiSpinner.spin$.next(false);
        this.back();
      } else {
        showNotification(this.snackBar, data.message, 'error');
        this.uiSpinner.spin$.next(false);
      }
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('EMERGENCY_CONTACT.CONFIRMATION_DIALOG.SAVING'),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.SAVE_EXIT'),
        cancelButtonText: this.translate.instant('COMMON.ACTIONS.DONT_SAVE'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.CANCEL'),
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Move to the vendor listing
          if (this.form.valid) {
            this.saveEmergencyContact();
          } else {
            // alert form invalidation
            showNotification(this.snackBar, this.translate.instant('EMERGENCY_CONTACT.CONFIRMATION_DIALOG.SUBMIT'), 'error');
          }
        } else if (result.isDenied) {
          // ;
        } else {
          this.back();
        }
      });
  }

  back(): void {
    this.router.navigate([WEB_ROUTES.USER_FORM], { queryParams: { _id: this.userId }, state: { value: 3 } });
  }
}
