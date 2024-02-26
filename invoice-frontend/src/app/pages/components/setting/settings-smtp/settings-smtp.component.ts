import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import { UiSpinnerService } from 'src/app/service/spinner.service';

@Component({
  selector: 'app-settings-smtp',
  templateUrl: './settings-smtp.component.html',
  styleUrls: ['./settings-smtp.component.scss']
})

export class SettingsSmtpComponent implements OnInit {
  smtpinfo: FormGroup;
  compnay_id: any;
  LTS_ACTIVE: any = configdata.LTS_ACTIVE;
  saveIcon = icon.SAVE_WHITE;
  verifyIcon = icon.EMAIL_RECIPAINT;
  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService) {

    this.smtpinfo = this.formBuilder.group({
      tenant_smtp_server: ['', Validators.required],
      tenant_smtp_username: ['', Validators.required],
      tenant_smtp_port: ['', Validators.required],
      tenant_smtp_timeout: ['', Validators.required],
      tenant_smtp_password: ['', Validators.required],
      tenant_smtp_security: ['', Validators.required],
      tenant_smtp_reply_to_mail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    let that = this;
    let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);

    this.httpCall.httpGetCall(httproutes.COMPNAY_SMTP_OTHER_SETTING_GET).subscribe(function (params) {
      if (params.status) {
        that.compnay_id = params.data.company_id;
        that.smtpinfo = that.formBuilder.group({
          tenant_smtp_server: [params.data.tenant_smtp_server, Validators.required],
          tenant_smtp_username: [params.data.tenant_smtp_username, Validators.required],
          tenant_smtp_port: [params.data.tenant_smtp_port, Validators.required],
          tenant_smtp_timeout: [params.data.tenant_smtp_timeout, Validators.required],
          tenant_smtp_password: [params.data.tenant_smtp_password, Validators.required],
          tenant_smtp_security: [params.data.tenant_smtp_security, Validators.required],
          tenant_smtp_reply_to_mail: [params.data.tenant_smtp_reply_to_mail, [Validators.required, Validators.email]],
        });
      }
    });
  }

  back(): void {

  }

  verifyData(): void {
    let that = this;
    if (this.smtpinfo.valid) {
      let reqObject = this.smtpinfo.value;
      console.log(reqObject);
      this.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCall(httproutes.COMPNAY_SMTP_OTHER_SETTING_VERIFY, reqObject).subscribe(function (params) {
        that.uiSpinner.spin$.next(false);
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
    }
  }

  saveData(): void {
    let that = this;
    let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    if (this.smtpinfo.valid) {
      let reqObject = this.smtpinfo.value;
      reqObject._id = this.compnay_id;
      this.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCall(httproutes.COMPNAY_SMTP_OTHER_SETTING_UPDATE, reqObject).subscribe(function (params) {
        that.uiSpinner.spin$.next(false);
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
    }
  }
}
