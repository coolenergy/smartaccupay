import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { swalWithBootstrapButtons, showNotification } from 'src/consts/utils';
import { SettingsService } from '../settings.service';
import { configData } from 'src/environments/configData';
import { AppComponent } from 'src/app/app.component';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
})
export class SecurityComponent {
  timerOptions = configData.TIMEROPTIONS;
  otpOptions = configData.OTPOPTIONS;
  settingObject: any;
  setting_id!: string;
  otpSwitch = false;
  timeoutSwitch = false;
  timer = '';
  tempTimer = '';
  tempTimerSwitch = '';
  otp = 'Yes';
  tempOtpSwitch = '';

  constructor (
    private router: Router,
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    public translate: TranslateService,
    public myapp: AppComponent
  ) { }

  ngOnInit(): void {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_GET)
      .subscribe(function (params) {
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;
            if (params.data.settings.Auto_Log_Off.setting_status == 'Active') {
              that.timeoutSwitch = true;
            } else {
              that.timeoutSwitch = false;
            }
            if (params.data.settings.Enable_OTP.setting_status == 'Active') {
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
    const settingKey = 'settings.' + 'Auto_Log_Off';
    const obj = this.settingObject['Auto_Log_Off'];
    obj.setting_status = event ? 'Active' : 'Inactive';
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.ALERT_SURE_WANT_CHANGE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: that.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.timeoutSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempTimerSwitch == 'Active') {
            that.timeoutSwitch = true;
          } else {
            that.timeoutSwitch = false;
          }
        }
      });
  }

  modelChangeTimeout(event: any) {
    // this.timer = event;
    const settingKey = 'settings.' + 'Auto_Log_Off';
    const obj = this.settingObject['Auto_Log_Off'];
    obj.setting_value = event;
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.ALERT_SURE_WANT_CHANGE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: that.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.timer = event;
          that.updateSetting(reqObject);
        } else {
          that.timer = that.tempTimer;
        }
      });
  }

  updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    that.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_UPDATE,
        objectForEdit
      )
      .subscribe(function (data) {
        if (data.status) {
          showNotification(that.snackBar, data.message, 'success');
          that.myapp.updateIdealTimeout();
        } else {
          showNotification(that.snackBar, data.message, 'error');
        }
      });
  }

  modelChangeOtp(event: any) {
    // this.timer = event;
    const settingKey = 'settings.' + 'Enable_OTP';
    const obj = this.settingObject['Enable_OTP'];
    obj.setting_value = event;
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.ALERT_SURE_WANT_CHANGE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: that.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.otp = event;
          that.updateSetting(reqObject);
        } else {
          that.otp = that.tempOtpSwitch;
        }
      });
  }

  modelSwitchChangeOtp(event: any) {
    const settingKey = 'settings.' + 'Enable_OTP';
    const obj = this.settingObject['Enable_OTP'];
    obj.setting_status = event ? 'Active' : 'Inactive';
    const reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.SECURITY_MODULE.ALERT_SURE_WANT_CHANGE'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: that.translate.instant('COMMON.ACTIONS.NO'),
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.otpSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempOtpSwitch == 'Active') {
            that.otpSwitch = true;
          } else {
            that.otpSwitch = false;
          }
        }
      });
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
