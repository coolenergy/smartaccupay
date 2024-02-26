import { Component, Inject, OnInit } from "@angular/core";
import { httproutes, icon } from "src/app/consts";
import { HttpCall } from "src/app/service/httpcall.service";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { ModeDetectService } from "../../../map/mode-detect.service";
import { UiSpinnerService } from "src/app/service/spinner.service";

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
  selector: 'app-employee-language',
  templateUrl: './employee-language.component.html',
  styleUrls: ['./employee-language.component.scss']
})
export class EmployeeLanguageComponent implements OnInit {

  alllanguage: any = [];
  Employee_Language_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  addIcon = icon.ADD_MY_SELF_WHITE;
  editIcon: string;
  deleteIcon: string;
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  yesButton: string = "";
  noButton: string = "";
  saveIcon = icon.SAVE_WHITE;

  constructor(
    private modeService: ModeDetectService,
    public dialog: MatDialog,
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    public translate: TranslateService
  ) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Employee_Language_Do_Want_Delete = this.translate.instant(
        "Employee_Language_Do_Want_Delete"
      );
      this.Compnay_Equipment_Delete_Yes = this.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      this.Compnay_Equipment_Delete_No = this.translate.instant(
        "Compnay_Equipment_Delete_No"
      );
    });

    var modeLocal = localStorage.getItem("darkmode");
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
    } else {
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
      } else {
        this.mode = "on";
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
      }
    });
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    this.getDataLanguage();
  }

  getDataLanguage() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.OTHER_LANGUAGE_GET)
      .subscribe(function (params) {
        if (params.status) {
          that.alllanguage = params.data;
        }
      });
  }

  deleteLanguage(language) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Employee_Language_Do_Want_Delete,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.OTHER_LANGUAGE_DELETE, {
              _id: language._id,
            })
            .subscribe(function (params) {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.getDataLanguage();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }

  addLanguage(reqData) {
    const dialogRef = this.dialog.open(EmployeeLanguageForm, {
      width: "450px",
      data: reqData,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getDataLanguage();
    });
  }
}


@Component({
  selector: 'employee-language-form',
  templateUrl: './employee-language-form.html',
  styleUrls: ['./employee-language.component.scss']
})
export class EmployeeLanguageForm implements OnInit {
  public Languageform: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  close_this_window: string;
  All_Save_Exit: string;
  Dont_Save: string;
  All_popup_Cancel: string;
  Language_Form_Submitting: string = "";

  constructor(
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<EmployeeLanguageForm>,
    public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    public spinner: UiSpinnerService,
  ) {
    this.Languageform = new FormGroup({
      name: new FormControl("", [Validators.required]),
    });
    if (this.data) {
      this.Languageform = new FormGroup({
        name: new FormControl(this.data.name, [
          Validators.required,
        ]),
      });
    }

    var modeLocal = localStorage.getItem("darkmode");
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });
    //let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.close_this_window = this.translate.instant("close_this_window");
      this.All_Save_Exit = this.translate.instant("All_Save_Exit");
      this.Dont_Save = this.translate.instant("Dont_Save");
      this.All_popup_Cancel = this.translate.instant("All_popup_Cancel");
      this.Language_Form_Submitting = this.translate.instant(
        "Language_Form_Submitting"
      );
    });
  }
  ngOnInit() { }

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
          // Move to the Users listing
          if (this.Languageform.valid) {
            this.saveData();
          } else {
            // alert form invalidation
            that.snackbarservice.openSnackBar(
              this.Language_Form_Submitting,
              "error"
            );
          }
        } else if (result.isDenied) {
          // setTimeout(() => {
          //   that.router.navigate(['/team-location']);
          // }, 100);
        } else {
          that.dialogRef.close();
        }
      });
  }
  saveData() {
    let that = this;
    if (this.Languageform.valid) {
      that.spinner.spin$.next(true);
      let reqData = this.Languageform.value;
      if (this.data) {
        reqData._id = this.data._id;
      }
      this.httpCall
        .httpPostCall(httproutes.OTHER_LANGUAGE_SAVE, reqData)
        .subscribe(function (params) {
          if (params.status) {
            that.spinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, "success");
            that.dialogRef.close();
          } else {
            that.spinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
    } else {
      that.spinner.spin$.next(false);
      // alert form invalidation
      that.snackbarservice.openSnackBar(this.Language_Form_Submitting, "error");
    }
  }
}

