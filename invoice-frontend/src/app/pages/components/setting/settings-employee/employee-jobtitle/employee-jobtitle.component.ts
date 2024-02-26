import { Component, Inject, OnInit } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../../map/mode-detect.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-employee-jobtitle',
  templateUrl: './employee-jobtitle.component.html',
  styleUrls: ['./employee-jobtitle.component.scss']
})
export class EmployeeJobtitleComponent implements OnInit {
  allJobtitle: any = [];
  Employee_Jobtitle_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  addIcon = icon.ADD_MY_SELF_WHITE;
  editIcon: string;
  deleteIcon: string;
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  yesButton: string = '';
  noButton: string = '';

  constructor(private modeService: ModeDetectService, public dialog: MatDialog, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Employee_Jobtitle_Do_Want_Delete = this.translate.instant('Employee_Jobtitle_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;

    } else {
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;


      } else {
        this.mode = 'on';
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;

      }

    });
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream(['']).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
    });

  }

  ngOnInit(): void {
    this.getDataJobTitle();
  }

  getDataJobTitle() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_JOB_TITLE_ALL).subscribe(function (params) {
      if (params.status) {
        that.allJobtitle = params.data;
      }
    });
  }

  deleteJobTitle(jobtitle: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_Jobtitle_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(httproutes.PORTAL_SETTING_JOB_TITLE_DELETE, { _id: jobtitle._id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.getDataJobTitle();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  addJobtitle(reqData: any) {
    const dialogRef = this.dialog.open(EmployeeJobTitleForm, {
      data: reqData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getDataJobTitle();
    });
  }

}

@Component({
  selector: 'employee-jobtitle-from',
  templateUrl: './employee-jobtitle-from.component.html',
  styleUrls: ['./employee-jobtitle.component.scss']
})
export class EmployeeJobTitleForm implements OnInit {
  public jobtitle: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';

  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<EmployeeJobTitleForm>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) {
    this.jobtitle = new FormGroup({
      job_title_name: new FormControl("", [Validators.required]),
    });
    if (this.data) {
      this.jobtitle = new FormGroup({
        job_title_name: new FormControl(this.data.job_title_name, [Validators.required]),
      });
    }

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.BACK;

    } else {
      this.exitIcon = icon.BACK_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.BACK;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.BACK_WHITE;

      }


    });

    this.translate.stream(['']).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
    });

  }
  ngOnInit() {

  }
  saveData() {
    let that = this;
    if (this.jobtitle.valid) {
      let reqData = this.jobtitle.value;
      if (this.data) {
        reqData._id = this.data._id;
      }
      this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_JOB_TITLE_SAVE, reqData).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.dialogRef.close();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
    }
  }
}
