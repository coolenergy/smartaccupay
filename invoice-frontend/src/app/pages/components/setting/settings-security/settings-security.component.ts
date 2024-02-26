import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppComponent } from "src/app/app.component";
import { httproutes } from "src/app/consts";
import { HttpCall } from "src/app/service/httpcall.service";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import { configdata } from "src/environments/configData";
import Swal from "sweetalert2";

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
  selector: 'app-settings-security',
  templateUrl: './settings-security.component.html',
  styleUrls: ['./settings-security.component.scss']
})
export class SettingsSecurityComponent implements OnInit {
  timerOptions = configdata.TIMEROPTIONS;
  otpOptions = configdata.OTPOPTIONS;
  settingObject: any;
  setting_id!: string;
  otpSwitch: boolean = false;
  timeoutSwitch: boolean = false;
  Project_Settings_Alert_Sure_Want_Change: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  timer: string = "";
  tempTimer: string = "";
  tempTimerSwitch: string = "";
  otp = "Yes";
  tempOtpSwitch: string = "";

  constructor (
    public myapp: AppComponent,
    public snackbarservice: Snackbarservice,
    public httpCall: HttpCall,
    public translate: TranslateService
  ) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Project_Settings_Alert_Sure_Want_Change = this.translate.instant(
        "Project_Settings_Alert_Sure_Want_Change"
      );
      this.Compnay_Equipment_Delete_Yes = this.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      this.Compnay_Equipment_Delete_No = this.translate.instant(
        "Compnay_Equipment_Delete_No"
      );
    });
  }

  ngOnInit(): void {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_SETTING_GET)
      .subscribe(function (params) {
        console.log(params);
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;
            if (params.data.settings.Auto_Log_Off.setting_status == "Active") {
              that.timeoutSwitch = true;
            } else {
              that.timeoutSwitch = false;
            }
            console.log(that.timeoutSwitch);
            if (params.data.settings.Enable_OTP.setting_status == "Active") {
              that.otpSwitch = true;
            } else {
              that.otpSwitch = false;
            }
            that.timer =
              params.data.settings.Auto_Log_Off.setting_value.toString();
            that.tempTimer =
              params.data.settings.Auto_Log_Off.setting_value.toString();
            that.otp = params.data.settings.Enable_OTP.setting_value.toString();
            that.tempTimerSwitch =
              params.data.settings.Auto_Log_Off.setting_status.toString();
            that.tempOtpSwitch =
              params.data.settings.Enable_OTP.setting_status.toString();
          }
        }
      });
  }

  modelSwitchChangeTimeOut(event: any) {
    console.log(event);
    let settingKey = "settings." + "Auto_Log_Off";
    let obj = this.settingObject["Auto_Log_Off"];
    obj.setting_status = event ? "Active" : "Inactive";
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
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
          that.timeoutSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempTimerSwitch == "Active") {
            that.timeoutSwitch = true;
          } else {
            that.timeoutSwitch = false;
          }
        }
      });
  }

  modelChangeTimeout(event: any) {
    console.log(event);
    // this.timer = event;
    let settingKey = "settings." + "Auto_Log_Off";
    let obj = this.settingObject["Auto_Log_Off"];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
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
          that.timer = event;
          that.updateSetting(reqObject);
        } else {
          console.log(this.timer);
          that.timer = that.tempTimer;
        }
      });
  }

  updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_SETTING_UPDATE, objectForEdit)
      .subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.myapp.updateIdealTimeout();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }

  modelChangeOtp(event: any) {
    console.log(event);
    // this.timer = event;
    let settingKey = "settings." + "Enable_OTP";
    let obj = this.settingObject["Enable_OTP"];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
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
          that.otp = event;
          that.updateSetting(reqObject);
        } else {
          console.log(this.timer);
          that.otp = that.tempOtpSwitch;
        }
      });
  }

  modelSwitchChangeOtp(event: any) {
    console.log(event);
    let settingKey = "settings." + "Enable_OTP";
    let obj = this.settingObject["Enable_OTP"];
    obj.setting_status = event ? "Active" : "Inactive";
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
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
          that.otpSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempOtpSwitch == "Active") {
            that.otpSwitch = true;
          } else {
            that.otpSwitch = false;
          }
        }
      });
  }
}
