import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { HttpCall } from "src/app/service/httpcall.service";
import { httproutes, icon } from "src/app/consts";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { configdata } from "src/environments/configData";
import { FormBuilder } from "@angular/forms";

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
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  @ViewChild("drop") nameField: ElementRef;

  settingObject: any;
  setting_id!: string;
  clockinradius_value!: string;

  Pending_items: boolean = false;
  Pending_items_value!: string;


  Invoice_Not_Assigned: boolean = false;
  Invoice_Not_Assigned_value!: string;

  Invoice_due_date: boolean = false;
  Invoice_due_time_value!: string;
  Invoice_due_day_value!: string;

  Invoice_arrive: boolean = false;
  Invoice_arrive_value!: [];

  Invoice_modified: boolean = false;
  Invoice_modified_value!: [];

  Invoice_sent_to_batch: boolean = false;
  Invoice_sent_to_batch_value!: [];

  daily_productivity_report: boolean = false;
  daily_productivity_report_value!: [];

  Invoice_Greater_Than_Amount_Approve: boolean = false;
  Invoice_Greater_Than_Amount_Approve_amount_value!: number;
  Invoice_Greater_Than_Amount_Approve_value!: [];

  User_Notify_By: boolean = false;
  User_Notify_By_value!: [];

  pendingdata: any = configdata.PENDING_ITEM_ALERT;
  duetime: any = configdata.INVOICE_DUE_TIME_ALERT;
  duedate: any = configdata.INVOICE_DUE_DAY_ALERT;
  notifyList: any = configdata.USER_NOTIFY_BY;


  Project_Settings_Alert_Sure_Want_Change: string = "";
  Document_Settings_Alert_Sure_Want_Change: string = '';
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  allRoles: any = [];
  allUser: any = [];
  pendingitems: string = "";
  temppendingitems: string = "";

  saveIcon = icon.SAVE_WHITE;

  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public translate: TranslateService) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Project_Settings_Alert_Sure_Want_Change = this.translate.instant("Project_Settings_Alert_Sure_Want_Change");
      this.Compnay_Equipment_Delete_Yes = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.Compnay_Equipment_Delete_No = this.translate.instant("Compnay_Equipment_Delete_No");

      this.Document_Settings_Alert_Sure_Want_Change = this.translate.instant("Document_Settings_Alert_Sure_Want_Change");
    });
  }

  ngOnInit(): void {
    let that = this;
    that.getAllRoles();
    that.getAllUser();
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;

            that.Pending_items_value = params.data.settings.Pending_items.setting_value;
            if (params.data.settings.Pending_items.setting_status == "Active") {
              that.Pending_items = true;
            } else {
              that.Pending_items = false;
            }


            that.Invoice_Not_Assigned_value = params.data.settings.Invoice_Not_Assigned.setting_value;
            if (params.data.settings.Invoice_Not_Assigned.setting_status == "Active") {
              that.Invoice_Not_Assigned = true;
            } else {
              that.Invoice_Not_Assigned = false;
            }

            that.Invoice_due_time_value = params.data.settings.Invoice_due_date.setting_value;
            that.Invoice_due_day_value = params.data.settings.Invoice_due_date.setting_value2;
            if (params.data.settings.Invoice_due_date.setting_status == "Active") {
              that.Invoice_due_date = true;
            } else {
              that.Invoice_due_date = false;
            }

            that.Invoice_arrive_value = params.data.settings.Invoice_arrive.setting_value;
            if (params.data.settings.Invoice_arrive.setting_status == "Active") {
              that.Invoice_arrive = true;
            } else {
              that.Invoice_arrive = false;
            }

            that.Invoice_modified_value = params.data.settings.Invoice_modified.setting_value;
            if (params.data.settings.Invoice_modified.setting_status == "Active") {
              that.Invoice_modified = true;
            } else {
              that.Invoice_modified = false;
            }
            that.Invoice_Greater_Than_Amount_Approve_value = params.data.settings.daily_productivity_report.setting_value;
            if (params.data.settings.daily_productivity_report.setting_status == "Active") {
              that.daily_productivity_report = true;
            } else {
              that.daily_productivity_report = false;
            }
            that.Invoice_sent_to_batch_value = params.data.settings.Invoice_sent_to_batch.setting_value;
            if (params.data.settings.Invoice_sent_to_batch.setting_status == "Active") {
              that.Invoice_sent_to_batch = true;
            } else {
              that.Invoice_sent_to_batch = false;
            }

            that.Invoice_Greater_Than_Amount_Approve_amount_value = Number(params.data.settings.Invoice_Greater_Than_Amount_Approve.setting_value);
            that.Invoice_Greater_Than_Amount_Approve_value = params.data.settings.Invoice_Greater_Than_Amount_Approve.setting_value2;
            if (params.data.settings.Invoice_Greater_Than_Amount_Approve.setting_status == "Active") {
              that.Invoice_Greater_Than_Amount_Approve = true;
            } else {
              that.Invoice_Greater_Than_Amount_Approve = false;
            }

            that.User_Notify_By_value = params.data.settings.User_Notify_By.setting_value;
            if (params.data.settings.User_Notify_By.setting_status == "Active") {
              that.User_Notify_By = true;
            } else {
              that.User_Notify_By = false;
            }
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
          if (checkoption == "Invoice_Greater_Than_Amount_Approve") {
            that.Invoice_Greater_Than_Amount_Approve_amount_value = that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value;
          }
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
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == "Pending_items") {
            that.Pending_items = !event;
          } else if (checkoption == "Invoice_Not_Assigned") {
            that.Invoice_Not_Assigned = !event;
          } else if (checkoption == "Invoice_due_date") {
            that.Invoice_due_date = !event;
          } else if (checkoption == "daily_productivity_report") {
            that.daily_productivity_report = !event;
          } else if (checkoption == "Invoice_sent_to_batch") {
            that.Invoice_sent_to_batch = !event;
          } else if (checkoption == "Invoice_arrive") {
            that.Invoice_arrive = !event;
          } else if (checkoption == "Invoice_modified") {
            that.Invoice_modified = !event;
          } else if (checkoption == "Invoice_Greater_Than_Amount_Approve") {
            that.Invoice_Greater_Than_Amount_Approve = !event;
          } else if (checkoption == "User_Notify_By") {
            that.User_Notify_By = !event;
          }
        }
      });
  }

  modelChangeDropdown(event: any, checkoption: any, firstSetting: boolean) {
    // this.timer = event;
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    if (firstSetting) {
      obj.setting_value = event;
    } else {
      obj.setting_value2 = event;
    }
    let reqObject = {
      [settingKey]: obj,
    };

    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          that.nameField.nativeElement.focus();
          if (checkoption == "Pending_items") {
            that.Pending_items_value =
              that.settingObject.Pending_items.setting_value;
          } else if (checkoption == "Invoice_Not_Assigned") {
            that.Invoice_Not_Assigned_value =
              that.settingObject.Invoice_Not_Assigned.setting_value;
          } else if (checkoption == "Invoice_due_date_value") {
            that.Invoice_due_time_value = that.settingObject.Invoice_due_date.setting_value;
            that.Invoice_due_day_value = that.settingObject.Invoice_due_date.setting_value2;
          } else if (checkoption == "Invoice_arrive") {
            that.Invoice_arrive_value = that.settingObject.Invoice_arrive.setting_value;
          } else if (checkoption == "Invoice_modified") {
            that.Invoice_modified = that.settingObject.Invoice_modified.setting_value;
          } else if (checkoption == "Invoice_sent_to_batch_value") {
            that.Invoice_sent_to_batch_value = that.settingObject.Invoice_sent_to_batch_value.setting_value;
          } else if (checkoption == "daily_productivity_report_value") {
            that.daily_productivity_report_value = that.settingObject.daily_productivity_report_value.setting_value;
          } else if (checkoption == "Invoice_Greater_Than_Amount_Approve") {
            that.Invoice_Greater_Than_Amount_Approve_amount_value = that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value;
            that.Invoice_Greater_Than_Amount_Approve_value = that.settingObject.Invoice_Greater_Than_Amount_Approve.setting_value2;
          } else if (checkoption == "User_Notify_By") {
            that.User_Notify_By_value = that.settingObject.User_Notify_By.setting_value;
          }
        }
      });
  }

  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;

      }
    });
  }

  getAllUser() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_GET_ALL_USERS).subscribe(function (params) {
      if (params.status) {
        that.allUser = params.data;

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

  saveSettings() {
    let that = this;
    let tempSettings = this.settingObject;
    tempSettings.Pending_items.setting_value = that.Pending_items_value;
    tempSettings.Invoice_Not_Assigned.setting_value = that.Invoice_Not_Assigned_value;
    tempSettings.Invoice_due_date.setting_value = that.Invoice_due_time_value;
    tempSettings.Invoice_due_date.setting_value2 = that.Invoice_due_day_value;
    tempSettings.Invoice_arrive.setting_value = that.Invoice_arrive_value;
    tempSettings.Invoice_modified.setting_value = that.Invoice_modified_value;
    tempSettings.Invoice_sent_to_batch.setting_value = that.Invoice_sent_to_batch_value;
    tempSettings.daily_productivity_report.setting_value = that.daily_productivity_report_value;
    tempSettings.Invoice_Greater_Than_Amount_Approve.setting_value = that.Invoice_Greater_Than_Amount_Approve_amount_value;
    tempSettings.Invoice_Greater_Than_Amount_Approve.setting_value2 = that.Invoice_Greater_Than_Amount_Approve_value;
    tempSettings.User_Notify_By.setting_value = that.User_Notify_By_value;

    let reqObject = {
      _id: that.setting_id,
      settings: tempSettings
    };
    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS, reqObject)
      .subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.settingObject = tempSettings;
        } else {
          tempSettings = that.settingObject;
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }
}
