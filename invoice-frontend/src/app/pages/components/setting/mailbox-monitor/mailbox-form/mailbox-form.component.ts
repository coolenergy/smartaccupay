import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../../map/mode-detect.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success s2-confirm margin-right-cust",
    denyButton: "btn btn-danger s2-confirm",
    cancelButton: "s2-confirm btn btn-gray ml-2",
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-mailbox-form',
  templateUrl: './mailbox-form.component.html',
  styleUrls: ['./mailbox-form.component.scss']
})
export class MailboxFormComponent implements OnInit {
  mailbpxform: FormGroup;
  compnay_id: any;
  LTS_ACTIVE: any = configdata.LTS_ACTIVE;
  saveIcon = icon.SAVE_WHITE;
  frequency = configdata.MAILBOX_MONITOR_TIME;
  cronTime: any;

  exitIcon: string;
  backIcon: string;
  mode: any;
  close_this_window: string = "";
  All_popup_Cancel = "";
  All_Save_Exit = "";
  Dont_Save = "";
  copyDataFromProject: string = "";
  yesButton: string = "";
  noButton: string = "";
  Company_vendor_Form_Submitting = "";
  subscription: Subscription;
  id: any;

  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice, private router: Router,
    public uiSpinner: UiSpinnerService, private modeService: ModeDetectService, public translate: TranslateService, public route: ActivatedRoute,) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;
      } else {
        this.mode = "on";
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");

      this.close_this_window = this.translate.instant("close_this_window");
      this.All_popup_Cancel = this.translate.instant("All_popup_Cancel");
      this.All_Save_Exit = this.translate.instant("All_Save_Exit");
      this.Dont_Save = this.translate.instant("Dont_Save");
      this.Company_vendor_Form_Submitting = this.translate.instant("Company_vendor_Form_Submitting");
    });


    this.mailbpxform = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      imap: ['', Validators.required],
      port: ['', Validators.required],
      time: ['', Validators.required],
    });
    if (this.id) {
      this.getOneMailbox();
    }
  }

  ngOnInit(): void {
  }

  confirmexit() {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.close_this_window,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.All_Save_Exit,
        cancelButtonText: this.Dont_Save,
        denyButtonText: this.All_popup_Cancel,
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {

          if (this.mailbpxform.valid) {
            // this.saveVendorData();
          } else {
            that.snackbarservice.openSnackBar(this.Company_vendor_Form_Submitting, "error");
          }
        } else if (result.isDenied) {
        } else {
          setTimeout(() => {
            that.back();
          }, 100);
        }
      });
  }
  onSelectTime(event) {
    let found = this.frequency.find((element) => element.time == event);
    this.cronTime = found.cron_time;

  }

  sendData() {
    let that = this;
    let reqObject = that.mailbpxform.value;
    reqObject.cron_time = this.cronTime;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_SETTINGS_SAVE_MAILBOX_MONITOR, reqObject)
      .subscribe(function (params_new) {
        if (params_new.status) {
          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
  }

  back() {
    this.router.navigate(["/setting"], { state: { value: 1 } });
  }
  getOneMailbox(): void {
    let that = this;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_GET_ONE_DATA, { _id: this.id })
      .subscribe(function (params) {
        if (params.status) {
          let mailBox = params.data;
          that.mailbpxform = that.formBuilder.group({
            email: [mailBox.email, [Validators.required, Validators.email]],
            password: ['', Validators.required,],
            imap: [mailBox.imap, Validators.required],
            port: [mailBox.port, Validators.required],
            time: [mailBox.time, Validators.required],
          });
          that.cronTime = mailBox.cron_time;
        }
      });
  }



}
