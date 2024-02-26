import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { showNotification } from 'src/consts/utils';
import { configData } from 'src/environments/configData';
import { SettingsService } from '../settings.service';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-smtp',
  templateUrl: './smtp.component.html',
  styleUrls: ['./smtp.component.scss'],
})
export class SmtpComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  companyinfoForm!: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  id: any;
  LTS_ACTIVE: any = configData.LTS_ACTIVE;
  frequency = configData.MAILBOX_MONITOR_TIME;
  cronTime: any;
  compnay_id: any;

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public route: ActivatedRoute,
    public httpCall: HttpCall,
    public SettingsServices: SettingsService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';

    this.getCompanySmtp();

    this.companyinfoForm = this.fb.group({
      tenant_smtp_server: ['', Validators.required],
      tenant_smtp_username: ['', Validators.required],
      tenant_smtp_port: ['', Validators.required],
      tenant_smtp_timeout: ['', Validators.required],
      tenant_smtp_password: ['', Validators.required],
      tenant_smtp_security: ['', Validators.required],
      tenant_smtp_reply_to_mail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void { }

  async getCompanySmtp() {
    const data = await this.SettingsServices.getCompanysmtp();
    if (data.status) {
      let stmp = data.data;
      this.compnay_id = stmp.company_id;
      this.companyinfoForm = this.fb.group({
        tenant_smtp_server: [stmp.smartaccupay_tenants.tenant_smtp_server, Validators.required],
        tenant_smtp_username: [stmp.smartaccupay_tenants.tenant_smtp_username, Validators.required],
        tenant_smtp_port: [stmp.smartaccupay_tenants.tenant_smtp_port, Validators.required],
        tenant_smtp_timeout: [stmp.smartaccupay_tenants.tenant_smtp_timeout, Validators.required],
        tenant_smtp_password: [stmp.smartaccupay_tenants.tenant_smtp_password, Validators.required],
        tenant_smtp_security: [stmp.smartaccupay_tenants.tenant_smtp_security, Validators.required],
        tenant_smtp_reply_to_mail: [stmp.smartaccupay_tenants.tenant_smtp_reply_to_mail, [Validators.required, Validators.email],],
      });
    }
  }

  async saveSMTP() {
    if (this.companyinfoForm.valid) {
      const formValues = this.companyinfoForm.value;
      formValues._id = this.compnay_id,
        this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.SaveSmtp(formValues);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async verifySMTP() {
    if (this.companyinfoForm.valid) {
      const formValues = this.companyinfoForm.value;
      formValues._id = this.compnay_id,
        this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.VerifySmtp(formValues);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
