import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants, httproutes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import Swal from 'sweetalert2';
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
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {
  Employee_Terms_Do_Want_Delete: string = "";
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
  public allTerms: any;

  constructor (private modeService: ModeDetectService, public dialog: MatDialog, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Employee_Terms_Do_Want_Delete = this.translate.instant('Employee_Terms_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
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
  }


  ngOnInit(): void {
    this.getDataTerms();
  }

  addTerms(term: any) {
    const dialogRef = this.dialog.open(TermsForm, {
      data: term,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getDataTerms();
    });
  }

  getDataTerms() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_TERMS).subscribe(function (params) {
      if (params.status) {
        that.allTerms = params.data;

      }
    });
  }


  deleteTerms(terms: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_Terms_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_TERMS, { _id: terms._id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.getDataTerms();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }
}

@Component({
  selector: 'terms-form',
  templateUrl: './terms-form.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsForm implements OnInit {
  public term: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';

  constructor (private modeService: ModeDetectService, public dialogRef: MatDialogRef<TermsForm>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) {

    this.term = new FormGroup({
      name: new FormControl("", [Validators.required]),
      due_days: new FormControl('', [Validators.required]),
      is_discount: new FormControl(false, []),
      discount: new FormControl('', []),
    });
    if (this.data) {
      this.term = new FormGroup({
        name: new FormControl(this.data.name, [Validators.required]),
        due_days: new FormControl(this.data.due_days, [Validators.required]),
        is_discount: new FormControl(this.data.is_discount, []),
        discount: new FormControl(this.data.discount, []),
      });
      if (this.data.is_discount) {
        this.term.get("discount").setValidators([Validators.required]);
      } else {
        this.term.get("discount").clearValidators();
      }
      this.term.get("discount").updateValueAndValidity();
    }


    var modeLocal = localStorage.getItem('');
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
  retainagePercentageChange(event) {
    let values = this.term.value;
    let pattern = /[^0-9.]/g;
    let digit = String.fromCharCode(event.charCode);
    let check_digit = digit.match(pattern);
    let check = check_digit === null;
    if (check) {
      let percentage = Number(
        `${values.discount}${digit}`
      );
      if (percentage > 100) {
        check = false;
        this.snackbarservice.openSnackBar(
          "Percentage must be less then 100.",
          "error"
        );
      }
    }
    return check;
  }


  saveData() {
    let that = this;
    if (this.term.valid) {
      let reqData = this.term.value;
      if (this.data) {
        reqData._id = this.data._id;
      }
      this.httpCall.httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_TERMS, reqData).subscribe(function (params) {
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


