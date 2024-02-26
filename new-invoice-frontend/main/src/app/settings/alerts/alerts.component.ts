import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { swalWithBootstrapButtons, showNotification } from 'src/consts/utils';
import { configData } from 'src/environments/configData';
import { SettingsService } from '../settings.service';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss'],
})
export class AlertsComponent implements OnInit {
  @ViewChild('drop') nameField!: ElementRef;

  settingObject: any;
  setting_id!: string;
  clockinradius_value!: string;

  Pending_items = false;
  Pending_items_value!: string;

  Invoice_Not_Assigned = false;
  Invoice_Not_Assigned_value!: string;

  Invoice_due_date = false;
  Invoice_due_time_value!: string;
  Invoice_due_day_value!: string;

  Invoice_arrive = false;
  Invoice_arrive_value!: [];

  Invoice_modified = false;
  Invoice_modified_value!: [];

  Invoice_sent_to_batch = false;
  Invoice_sent_to_batch_value!: [];

  daily_productivity_report = false;
  daily_productivity_report_value!: [];

  Invoice_Greater_Than_Amount_Approve = false;
  Invoice_Greater_Than_Amount_Approve_amount_value!: number;
  Invoice_Greater_Than_Amount_Approve_value!: [];

  User_Notify_By = false;
  User_Notify_By_value!: [];

  pendingdata: any = configData.PENDING_ITEM_ALERT;
  duetime: any = configData.INVOICE_DUE_TIME_ALERT;
  duedate: any = configData.INVOICE_DUE_DAY_ALERT;
  notifyList: any = configData.USER_NOTIFY_BY;

  Project_Settings_Alert_Sure_Want_Change = '';
  Document_Settings_Alert_Sure_Want_Change = '';
  Compnay_Equipment_Delete_Yes = '';
  Compnay_Equipment_Delete_No = '';
  allRoles: any = [];
  allUser: any = [];
  pendingitems = '';
  temppendingitems = '';

  saveIcon = '';

  constructor (
    public httpCall: HttpCall,
    public translate: TranslateService,
    private router: Router,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    public myapp: AppComponent
  ) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Project_Settings_Alert_Sure_Want_Change = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.ALERTS_MODULE.ALL_PROJECT'
      );
      this.Document_Settings_Alert_Sure_Want_Change = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.ALERTS_MODULE.ALL_DOCUMENT'
      );
    });
  }

  ngOnInit(): void {
    let that = this;
    that.getAllRoles();
    that.getAllUser();
    that.httpCall
      .httpGetCall(
        httpversion.PORTAL_V1 +
        httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS
      )
      .subscribe(function (data) {
        if (data.status) {
          if (data.data) {
            that.settingObject = data.data.settings;
            that.setting_id = data.data._id;
            that.Pending_items_value =
              data.data.settings.Pending_items.setting_value;
            if (data.data.settings.Pending_items.setting_status == 'Active') {
              that.Pending_items = true;
            } else {
              that.Pending_items = false;
            }

            that.Invoice_Not_Assigned_value =
              data.data.settings.Invoice_Not_Assigned.setting_value;
            if (
              data.data.settings.Invoice_Not_Assigned.setting_status == 'Active'
            ) {
              that.Invoice_Not_Assigned = true;
            } else {
              that.Invoice_Not_Assigned = false;
            }

            that.Invoice_due_time_value =
              data.data.settings.Invoice_due_date.setting_value;
            that.Invoice_due_day_value =
              data.data.settings.Invoice_due_date.setting_value2;
            if (
              data.data.settings.Invoice_due_date.setting_status == 'Active'
            ) {
              that.Invoice_due_date = true;
            } else {
              that.Invoice_due_date = false;
            }

            that.Invoice_arrive_value =
              data.data.settings.Invoice_arrive.setting_value;
            if (data.data.settings.Invoice_arrive.setting_status == 'Active') {
              that.Invoice_arrive = true;
            } else {
              that.Invoice_arrive = false;
            }

            that.Invoice_modified_value =
              data.data.settings.Invoice_modified.setting_value;
            if (
              data.data.settings.Invoice_modified.setting_status == 'Active'
            ) {
              that.Invoice_modified = true;
            } else {
              that.Invoice_modified = false;
            }
            that.Invoice_Greater_Than_Amount_Approve_value =
              data.data.settings.daily_productivity_report.setting_value;
            if (
              data.data.settings.daily_productivity_report.setting_status ==
              'Active'
            ) {
              that.daily_productivity_report = true;
            } else {
              that.daily_productivity_report = false;
            }
            that.Invoice_sent_to_batch_value =
              data.data.settings.Invoice_sent_to_batch.setting_value;
            if (
              data.data.settings.Invoice_sent_to_batch.setting_status ==
              'Active'
            ) {
              that.Invoice_sent_to_batch = true;
            } else {
              that.Invoice_sent_to_batch = false;
            }

            that.Invoice_Greater_Than_Amount_Approve_amount_value = Number(
              data.data.settings.Invoice_Greater_Than_Amount_Approve
                .setting_value
            );
            that.Invoice_Greater_Than_Amount_Approve_value =
              data.data.settings.Invoice_Greater_Than_Amount_Approve.setting_value2;
            if (
              data.data.settings.Invoice_Greater_Than_Amount_Approve
                .setting_status == 'Active'
            ) {
              that.Invoice_Greater_Than_Amount_Approve = true;
            } else {
              that.Invoice_Greater_Than_Amount_Approve = false;
            }

            that.User_Notify_By_value =
              data.data.settings.User_Notify_By.setting_value;
            if (data.data.settings.User_Notify_By.setting_status == 'Active') {
              that.User_Notify_By = true;
            } else {
              that.User_Notify_By = false;
            }
          }
        }
      });
  }

  modelChangeLocationText(event: any, checkoption: string) {
    const settingKey = 'settings.' + checkoption;
    const obj = this.settingObject[checkoption];
    obj.setting_value = event.target.value;
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Document_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == 'Invoice_Greater_Than_Amount_Approve') {
            that.Invoice_Greater_Than_Amount_Approve_amount_value =
              that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value;
          }
        }
      });
  }

  numberOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  modelChangeSwitch(event: any, checkoption: any) {
    const settingKey = 'settings.' + checkoption;
    const obj = this.settingObject[checkoption];
    obj.setting_status = event ? 'Active' : 'Inactive';
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == 'Pending_items') {
            that.Pending_items = !event;
          } else if (checkoption == 'Invoice_Not_Assigned') {
            that.Invoice_Not_Assigned = !event;
          } else if (checkoption == 'Invoice_due_date') {
            that.Invoice_due_date = !event;
          } else if (checkoption == 'daily_productivity_report') {
            that.daily_productivity_report = !event;
          } else if (checkoption == 'Invoice_sent_to_batch') {
            that.Invoice_sent_to_batch = !event;
          } else if (checkoption == 'Invoice_arrive') {
            that.Invoice_arrive = !event;
          } else if (checkoption == 'Invoice_modified') {
            that.Invoice_modified = !event;
          } else if (checkoption == 'Invoice_Greater_Than_Amount_Approve') {
            that.Invoice_Greater_Than_Amount_Approve = !event;
          } else if (checkoption == 'User_Notify_By') {
            that.User_Notify_By = !event;
          }
        }
      });
  }

  modelChangeDropdown(event: any, checkoption: any, firstSetting: boolean) {
    // this.timer = event;
    const settingKey = 'settings.' + checkoption;
    const obj = this.settingObject[checkoption];
    if (firstSetting) {
      obj.setting_value = event;
    } else {
      obj.setting_value2 = event;
    }
    const reqObject = {
      [settingKey]: obj,
    };

    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          that.nameField.nativeElement.focus();
          if (checkoption == 'Pending_items') {
            that.Pending_items_value =
              that.settingObject.Pending_items.setting_value;
          } else if (checkoption == 'Invoice_Not_Assigned') {
            that.Invoice_Not_Assigned_value =
              that.settingObject.Invoice_Not_Assigned.setting_value;
          } else if (checkoption == 'Invoice_due_date_value') {
            that.Invoice_due_time_value =
              that.settingObject.Invoice_due_date.setting_value;
            that.Invoice_due_day_value =
              that.settingObject.Invoice_due_date.setting_value2;
          } else if (checkoption == 'Invoice_arrive') {
            that.Invoice_arrive_value =
              that.settingObject.Invoice_arrive.setting_value;
          } else if (checkoption == 'Invoice_modified') {
            that.Invoice_modified =
              that.settingObject.Invoice_modified.setting_value;
          } else if (checkoption == 'Invoice_sent_to_batch_value') {
            that.Invoice_sent_to_batch_value =
              that.settingObject.Invoice_sent_to_batch_value.setting_value;
          } else if (checkoption == 'daily_productivity_report_value') {
            that.daily_productivity_report_value =
              that.settingObject.daily_productivity_report_value.setting_value;
          } else if (checkoption == 'Invoice_Greater_Than_Amount_Approve') {
            that.Invoice_Greater_Than_Amount_Approve_amount_value =
              that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value;
            that.Invoice_Greater_Than_Amount_Approve_value =
              that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value2;
          } else if (checkoption == 'User_Notify_By') {
            that.User_Notify_By_value =
              that.settingObject.User_Notify_By.setting_value;
          }
        }
      });
  }

  getAllRoles() {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_ROLES_ALL)
      .subscribe(function (data) {
        if (data.status) {
          that.allRoles = data.data;
        }
      });
  }

  getAllUser() {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_GET_ALL_USERS)
      .subscribe(function (data) {
        if (data.status) {
          that.allUser = data.data;
        }
      });
  }

  updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 +
        httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS,
        objectForEdit
      )
      .subscribe(function (data) {
        if (data.status) {
          showNotification(that.snackBar, data.message, 'success');
        } else {
          showNotification(that.snackBar, data.message, 'error');
        }
      });
  }

  saveSettings() {
    let that = this;
    let tempSettings = this.settingObject;
    tempSettings.Pending_items.setting_value = that.Pending_items_value;
    tempSettings.Invoice_Not_Assigned.setting_value =
      that.Invoice_Not_Assigned_value;
    tempSettings.Invoice_due_date.setting_value = that.Invoice_due_time_value;
    tempSettings.Invoice_due_date.setting_value2 = that.Invoice_due_day_value;
    tempSettings.Invoice_arrive.setting_value = that.Invoice_arrive_value;
    tempSettings.Invoice_modified.setting_value = that.Invoice_modified_value;
    tempSettings.Invoice_sent_to_batch.setting_value =
      that.Invoice_sent_to_batch_value;
    tempSettings.daily_productivity_report.setting_value =
      that.daily_productivity_report_value;
    tempSettings.Invoice_Greater_Than_Amount_Approve.setting_value =
      that.Invoice_Greater_Than_Amount_Approve_amount_value;
    tempSettings.Invoice_Greater_Than_Amount_Approve.setting_value2 =
      that.Invoice_Greater_Than_Amount_Approve_value;
    tempSettings.User_Notify_By.setting_value = that.User_Notify_By_value;

    const reqObject = {
      _id: that.setting_id,
      settings: tempSettings,
    };
    this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 +
        httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS,
        reqObject
      )
      .subscribe(function (data) {
        if (data.status) {
          showNotification(that.snackBar, data.message, 'success');
          that.settingObject = tempSettings;
        } else {
          tempSettings = that.settingObject;
          showNotification(that.snackBar, data.message, 'error');
        }
      });
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
