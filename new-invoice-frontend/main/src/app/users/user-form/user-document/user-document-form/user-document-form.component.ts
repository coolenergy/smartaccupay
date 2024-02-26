import { Component, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { UserService } from 'src/app/users/user.service';
import { RolePermission } from 'src/consts/common.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification, swalWithBootstrapButtons, timeDateToepoch } from 'src/consts/utils';

@Component({
  selector: 'app-user-document-form',
  templateUrl: './user-document-form.component.html',
  styleUrls: ['./user-document-form.component.scss']
})
export class UserDocumentFormComponent implements OnInit {
  form!: UntypedFormGroup;
  id: any;
  userId: any;
  showHideDate = false;

  variablesDocumentTypeList: any = [];
  documentTypeList: any = this.variablesDocumentTypeList.slice();
  role_permission!: RolePermission;
  isImageSaved = false;
  cardImageBase64: any;
  filepath: any;

  constructor (public uiSpinner: UiSpinnerService, public userService: UserService, private fb: UntypedFormBuilder,
    public route: ActivatedRoute, private router: Router, private formBuilder: FormBuilder, private snackBar: MatSnackBar,
    public translate: TranslateService, private commonService: CommonService) {
    this.id = this.route.snapshot.queryParamMap.get("_id");
    this.userId = this.route.snapshot.queryParamMap.get("user_id");
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;

    this.form = this.formBuilder.group({
      userdocument_type_id: ["", Validators.required],
      userdocument_expire_date: [""],
    });
  }

  ngOnInit() {
    this.getDocumentType();
  }

  async getOneUserDocument() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_USER_DOCUMENT, { _id: this.id });
    this.form = this.formBuilder.group({
      userdocument_type_id: [data.data.userdocument_type_id, Validators.required],
      userdocument_expire_date: [new Date(data.data.userdocument_expire_date * 1000)],
    });
    this.selectDocumentType(data.data.userdocument_type_id);
  }

  async getDocumentType() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_GET);
    if (data.status) {
      this.variablesDocumentTypeList = data.data;
      this.documentTypeList = this.variablesDocumentTypeList.slice();
    }
    if (this.id) {
      this.getOneUserDocument();
    }
  }

  async saveUserDocument() {
    if (this.form.valid) {
      const reqObject = this.form.value;
      let apiURL = httpversion.PORTAL_V1 + httproutes.SAVE_USER_DOCUMENT;
      if (this.id) {
        reqObject._id = this.id;
        apiURL = httpversion.PORTAL_V1 + httproutes.EDIT_USER_DOCUMENT;
      }
      reqObject.emergency_contact_userid = this.userId;
      this.uiSpinner.spin$.next(true);
      if (this.showHideDate) {
        reqObject.userdocument_expire_date = timeDateToepoch(new Date(reqObject.userdocument_expire_date));
      } else {
        reqObject.userdocument_expire_date = 0;
      }

      const formData = new FormData();
      formData.append("file", this.filepath);
      formData.append("reqObject", JSON.stringify(reqObject));
      formData.append("user_id", this.userId);
      if (this.id) {
        formData.append("_id", this.id);
      }

      const data = await this.commonService.postRequestAPI(apiURL, formData);
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
        title: this.translate.instant('DOCUMENT.CONFIRMATION_DIALOG.SAVING'),
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
            this.saveUserDocument();
          } else {
            // alert form invalidation
            showNotification(this.snackBar, this.translate.instant('DOCUMENT.CONFIRMATION_DIALOG.SUBMIT'), 'error');
          }
        } else if (result.isDenied) {
          // ;
        } else {
          this.back();
        }
      });
  }

  back(): void {
    this.router.navigate([WEB_ROUTES.USER_FORM], { queryParams: { _id: this.userId }, state: { value: 4 } });
  }

  selectDocumentType(event: Event) {
    const found = this.documentTypeList.find((element: any) => element._id == event);
    this.showHideDate = found.is_expiration;
    if (this.showHideDate) {
      this.form.get("userdocument_expire_date")?.setValidators([Validators.required]);
      this.form.get("userdocument_expire_date")?.updateValueAndValidity();
    } else {
      this.form.get("userdocument_expire_date")?.setValidators([]);
      this.form.get("userdocument_expire_date")?.updateValueAndValidity();
    }
  }

  fileChangeEvent(fileInput: any) {
    commonFileChangeEvent(fileInput, 'all').then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        showNotification(this.snackBar, result.message, 'error');
      }
    });
  }
}
