import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { SettingsService } from '../settings.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-documentview',
  templateUrl: './documentview.component.html',
  styleUrls: ['./documentview.component.scss']
})
export class DocumentviewComponent {

  Document_View_time_value!: string;
  Document_View = false;
  Archive_Orphan_Document_time_value!: string;
  Archive_Orphan_Document = false;
  settingObject: any;
  setting_id!: string;
  Document_Settings_Alert_Sure_Want_Change = "";
  Compnay_Equipment_Delete_Yes = "";
  Compnay_Equipment_Delete_No = "";

  constructor (private router: Router, private formBuilder: FormBuilder, public httpCall: HttpCall, private snackBar: MatSnackBar,
    public SettingsServices: SettingsService, public translate: TranslateService, public commonService: CommonService) {

  }

  ngOnInit() {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
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

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
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
        title: "This is a global setting that will affect all document. Are you sure you want to make the change?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
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

  modelChangeLocationText(event: any, checkoption: any) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: "This is a global setting that will affect all document. Are you sure you want to make the change?",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
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

  async updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.INVOICE_OTHER_SETTING_UPDATE_ALERTS, objectForEdit);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
}
