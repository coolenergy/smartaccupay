import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { showNotification, swalWithBootstrapButtons } from 'src/consts/utils';
import { SettingsService } from '../../settings.service';
import { configData } from 'src/environments/configData';
import { TranslateService } from '@ngx-translate/core';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-mailbox-form',
  templateUrl: './mailbox-form.component.html',
  styleUrls: ['./mailbox-form.component.scss'],
})
export class MailboxFormComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  companyinfoForm!: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  id: any;
  frequency = configData.MAILBOX_MONITOR_TIME;
  cronTime: any;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    public translate: TranslateService,
    public httpCall: HttpCall,
    // public commonService: CommonService,
    public SettingsServices: SettingsService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    if (this.id) {
      this.getOneMailbox();
    }

    this.companyinfoForm = this.fb.group({
      password: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      imap: ['', [Validators.required]],
      port: [''],
      time: [''],
    });
  }

  onSelectTime(event: any) {
    let found = this.frequency.find((element) => element.time == event);
    this.cronTime = found?.cron_time;
  }

  async getOneMailbox() {
    const data = await this.SettingsServices.getOneMailBox(this.id);
    if (data.status) {
      let mailBox = data.data;
      this.companyinfoForm = this.fb.group({
        email: [mailBox.email, [Validators.required, Validators.email]],
        password: ['', Validators.required],
        imap: [mailBox.imap, Validators.required],
        port: [mailBox.port, Validators.required],
        time: [mailBox.time, Validators.required],
      });
      this.cronTime = mailBox.cron_time;
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('VENDOR.CONFIRMATION_DIALOG.SAVING'),
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
          if (this.companyinfoForm.valid) {
            this.saveMailBox();
          } else {
            // alert form invalidation
            showNotification(
              this.snackBar,
              'Please complete the mailbox form before submitting.',
              'error'
            );
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.back();
          }, 100);
        }
      });
  }

  async saveMailBox() {
    let that = this;
    if (this.companyinfoForm.valid) {
      let requestObject = this.companyinfoForm.value;
      requestObject.cron_time = this.cronTime;
      if (this.id) {
        requestObject._id = this.id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.AddMailbox(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.back();
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  back() {
    this.router.navigate([WEB_ROUTES.MAILBOX_SETTING]);
  }
}