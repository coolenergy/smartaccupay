import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
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
  selector: 'app-employee-document-type',
  templateUrl: './employee-document-type.component.html',
  styleUrls: ['./employee-document-type.component.scss']
})
export class EmployeeDocumentTypeComponent implements OnInit {
  Employee_Document_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  saveIcon = icon.SAVE_WHITE;

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
      this.Employee_Document_Do_Want_Delete = this.translate.instant('Employee_Document_Do_Want_Delete');
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

  public allDocument: any;
  ngOnInit(): void {
    this.getDataDocumentType();
  }

  getDataDocumentType() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_DOCUMENT_TYPE_GET).subscribe(function (params) {
      if (params.status) {
        that.allDocument = params.data;
      }
    });
  }

  addDocumentType(reqData: any) {
    const dialogRef = this.dialog.open(EmployeeDocumentTypeForm, { data: reqData, disableClose: true },
    );


    dialogRef.afterClosed().subscribe(result => {
      this.getDataDocumentType();
    });
  }

  deleteDocumentType(doc_data: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_Document_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(httproutes.PORTAL_SETTING_DOCUMENT_TYPE_DELETE, { _id: doc_data._id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.getDataDocumentType();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }


}

@Component({
  selector: 'employee-document-type-form',
  templateUrl: './employee-document-type-form.html',
  styleUrls: ['./employee-document-type.component.scss']
})
export class EmployeeDocumentTypeForm implements OnInit {
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';

  public employeedocumenttype: FormGroup;
  saveIcon = icon.SAVE_WHITE;

  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<EmployeeDocumentTypeForm>,
    public translate: TranslateService, @Inject(MAT_DIALOG_DATA) public data: any,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice) {
    this.employeedocumenttype = new FormGroup({
      document_type_name: new FormControl("", [Validators.required]),
      is_expiration: new FormControl(false)
    });
    if (this.data) {
      this.employeedocumenttype = new FormGroup({
        document_type_name: new FormControl(this.data.document_type_name, [Validators.required]),
        is_expiration: new FormControl(this.data.is_expiration)
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
    //let that = this;
    // this.uiSpinner.spin$.next(true);
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
    if (this.employeedocumenttype.valid) {
      let reqData = this.employeedocumenttype.value;
      if (this.data) {
        reqData._id = this.data._id;
      }
      this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_DOCUMENT_TYPE_SAVE, reqData).subscribe(function (params) {
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
