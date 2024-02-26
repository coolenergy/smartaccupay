import { Component, Inject, OnInit } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { ModeDetectService } from '../../../map/mode-detect.service';
import { Subscription } from 'rxjs';

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
  selector: 'app-employee-relationship',
  templateUrl: './employee-relationship.component.html',
  styleUrls: ['./employee-relationship.component.scss']
})
export class EmployeeRelationshipComponent implements OnInit {
  allRelationship: any = [];
  Employee_Relationship_Do_Want_Delete: string = "";
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
      this.Employee_Relationship_Do_Want_Delete = this.translate.instant('Employee_Relationship_Do_Want_Delete');
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
    this.getDataRelationship();
  }

  getDataRelationship() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_RELATIONSHIP_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRelationship = params.data;
      }
    });
  }

  deleteRelationship(relationship: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_Relationship_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(httproutes.PORTAL_SETTING_RELATIONSHIP_DELETE, { _id: relationship._id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.getDataRelationship();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  addRelationship(reqData: any) {
    const dialogRef = this.dialog.open(EmployeeRelationshipForm, {
      data: reqData,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getDataRelationship();
    });
  }


}

@Component({
  selector: 'employee-relationship-form',
  templateUrl: './employee-relationship-form.html',
  styleUrls: ['./employee-relationship.component.scss']
})
export class EmployeeRelationshipForm implements OnInit {

  public employeerelationship: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';

  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<EmployeeRelationshipForm>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) {
    this.employeerelationship = new FormGroup({
      relationship_name: new FormControl("", [Validators.required]),
    });
    if (this.data) {
      this.employeerelationship = new FormGroup({
        relationship_name: new FormControl(this.data.relationship_name, [Validators.required]),
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
    if (this.employeerelationship.valid) {
      let reqData = this.employeerelationship.value;
      if (this.data) {
        reqData._id = this.data._id;
      }
      this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_RELATIONSHIP_SAVE, reqData).subscribe(function (params) {
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
