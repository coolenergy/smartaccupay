import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { httproutes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from "@ngx-translate/core";
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});


@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit {
  // documentviews: any;
  Document_View_time_value!: string;
  Document_View: boolean = false;
  Archive_Orphan_Document_time_value!: string;
  Archive_Orphan_Document: boolean = false;
  settingObject: any;
  setting_id!: string;
  Document_Settings_Alert_Sure_Want_Change: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Document_Settings_Alert_Sure_Want_Change = this.translate.instant("Document_Settings_Alert_Sure_Want_Change");
      this.Compnay_Equipment_Delete_Yes = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.Compnay_Equipment_Delete_No = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }


  ngOnInit(): void {
    // this.documentviews = this.formBuilder.group({
    //   documentview: ['', Validators.required],

    // });
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;
            if (params.data.settings.Document_View) {
              that.Document_View_time_value = params.data.settings.Document_View.setting_value;
              if (params.data.settings.Document_View.setting_status == "Active") {
                that.Document_View = true;
              } else {
                that.Document_View = false;
              }
            } else {
              that.Document_View = false;
              that.Document_View_time_value = '45';
            }

            if (params.data.settings.Archive_Orphan_Document) {
              that.Archive_Orphan_Document_time_value = params.data.settings.Archive_Orphan_Document.setting_value;
              if (params.data.settings.Archive_Orphan_Document.setting_status == "Active") {
                that.Archive_Orphan_Document = true;
              } else {
                that.Archive_Orphan_Document = false;
              }
            } else {
              that.Archive_Orphan_Document = false;
              that.Archive_Orphan_Document_time_value = '30';
            }
          }
        }
      });

  }

  modelChangeSwitch(event: any, checkoption: any) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_status = event ? "Active" : "Inactive";
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Document_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == "Document_View") {
            that.Document_View = !event;
          } else if (checkoption == "Archive_Orphan_Document") {
            that.Archive_Orphan_Document = !event;
          }
        }
      });
  }

  modelChangeLocationText(event, checkoption) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Document_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == "Document_View") {
            that.Document_View_time_value = that.settingObject.Document_View.setting_value;
          } else if (checkoption == "Archive_Orphan_Document") {
            that.Archive_Orphan_Document_time_value = that.settingObject.Archive_Orphan_Document.setting_value;
          }
        }
      });
  }
  updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS, objectForEdit)
      .subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }


  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

}
