import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Subscription } from 'rxjs';
import { ModeDetectService } from "../../map/mode-detect.service";
import Swal from 'sweetalert2';
import { fullDate_format, LanguageApp, logobase64 } from 'src/app/service/utils';
import { HttpCall } from 'src/app/service/httpcall.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { configdata } from 'src/environments/configData';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from "xlsx";
import { ImportEmpSettingDownload } from '../settings-employee/settings-employee.component';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Workbook } from "exceljs";
import * as fs from "file-saver";

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success s2-confirm margin-right-cust",
    denyButton: "btn btn-danger s2-confirm",
    cancelButton: "s2-confirm btn btn-gray ml-2",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-cost-code',
  templateUrl: './cost-code.component.html',
  styleUrls: ['./cost-code.component.scss']
})
export class CostCodeComponent implements OnInit {
  [x: string]: any;
  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  mode: any;
  subscription: Subscription;
  editIcon: string;
  deleteIcon: string;
  exportIcon: string;
  importIcon: string;
  addIcon = icon.ADD_MY_SELF_WHITE;
  dtOptions: DataTables.Settings = {};
  copyDataFromProject: string = '';
  yesButton: string = '';
  noButton: string = '';
  Table_Costcode_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Data_Not_Found: string = '';
  Export_file_message: string = '';
  Company_Equipment_File_Not_Match: string = '';
  Settings_Costcode_Division: string = "";
  Settings_Costcode: string = "";
  Settings_Costcode_Description: string = "";
  Settings_Costcode_Action: string = "";
  Expenses_Action_Edit: string = "";
  Expenses_Action_Delete: string = "";
  locallanguage: any;
  showTable: boolean = true;

  constructor(private modeService: ModeDetectService, public httpCall: HttpCall, public http: HttpClient, public dialog: MatDialog,
    public sb: Snackbarservice, public translate: TranslateService, public mostusedservice: Mostusedservice,) {
    var modeLocal = localStorage.getItem('darkmood');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
      this.importIcon = icon.IMPORT;
      this.exportIcon = icon.EXPORT;
    } else {
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
      this.importIcon = icon.IMPORT_WHITE;
      this.exportIcon = icon.EXPORT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
        this.importIcon = icon.IMPORT;
        this.exportIcon = icon.EXPORT;
      } else {
        this.mode = 'on';
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
        this.importIcon = icon.IMPORT_WHITE;
        this.exportIcon = icon.EXPORT_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.Company_Equipment_File_Not_Match = this.translate.instant("Company_Equipment_File_Not_Match");
      this.Settings_Costcode_Division = this.translate.instant("Settings_Costcode_Division");
      this.Settings_Costcode = this.translate.instant("Settings_Costcode");
      this.Settings_Costcode_Description = this.translate.instant("Settings_Costcode_Description");
      this.Settings_Costcode_Action = this.translate.instant("Settings_Costcode_Action");
      this.Expenses_Action_Edit = this.translate.instant("Expenses_Action_Edit");
      this.Expenses_Action_Delete = this.translate.instant("Expenses_Action_Delete");
      this.Table_Costcode_Do_Want_Delete = this.translate.instant("Table_Costcode_Do_Want_Delete");
      this.Compnay_Equipment_Delete_Yes = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.Compnay_Equipment_Delete_No = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Data_Not_Found = this.translate.instant('Data_Not_Found');
      this.Export_file_message = this.translate.instant('Export_file_message');
    });
  }

  ngOnInit(): void {
    let that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let headers = new HttpHeaders({
      Authorization: token,
    });
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );

        dataTablesParameters.module = 'Invoice';
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PROJECT_SETTING_COST_CODE_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
          });
      },
      columns: this.getColumName(),
      "drawCallback": () => {
        $(".button_costcodeEditClass").on(
          "click",
          (event) => {
            let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
            this.addCostCode(data);
          }
        );
        $(".button_costcodeDeleteClass").on(
          "click",
          (event) => {
            let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
            this.deleteCostCode(data._id);
          }
        );
      }
    };
  }

  deleteCostCode(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Table_Costcode_Do_Want_Delete,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.Compnay_Equipment_Delete_Yes,
        denyButtonText: that.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.PROJECT_SETTING_COST_CODE_DELETE, {
              _id: _id,
            })
            .subscribe(function (params) {
              if (params.status) {
                that.sb.openSnackBar(params.message, "success");
                that.rerenderfunc();
              } else {
                that.sb.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }

  downloadImportTemplate() {
    let that = this;
    const dialogRef = this.dialog.open(ImportEmpSettingDownload, {
      data: "costcode-setting",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  rerenderfunc() {
    var tmp_locallanguage = localStorage.getItem("sitelanguage");
    this.showTable = false;
    this.dtOptions.language =
      tmp_locallanguage == "en"
        ? LanguageApp.english_datatables
        : LanguageApp.spanish_datatables;
    this.dtOptions.columns = this.getColumName();
    //this.dtOptions.columns = this.getchecklistColumName();
    let that = this;
    setTimeout(() => {
      that.showTable = true;
    }, 100);
  }

  getColumName() {
    let that = this;
    return [{
      title: "Divison",
      data: "division"
    },

    {
      title: "Cost Code",
      data: 'value'
    },
    {
      title: "Description",
      data: 'description'
    },
    {
      title: "Action",
      render: function (data: any, type: any, full: any) {
        return `
            <div class="dropdown">
              <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust" aria-hidden="true"></i>
              <div class="dropdown-content-cust">
                <a edit_tmp_id='`+ JSON.stringify(full) + `' class="button_costcodeEditClass" >` + '<img src="' + that.editIcon + '" alt="" height="15px">' + that.Expenses_Action_Edit + `</a>
                <a edit_tmp_id='`+ JSON.stringify(full) + `' class="button_costcodeDeleteClass" >` + '<img src="' + that.deleteIcon + '" alt="" height="15px">' + that.Expenses_Action_Delete + `</a>
              </div>
          </div>
         `;
      },
      width: "7%",
      orderable: false
    }
    ];
  }

  addCostCode(reqData): void {
    let that = this;
    const dialogRef = this.dialog.open(CostCodeFormComponent, {
      data: {
        reqData: reqData,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      that.rerenderfunc();
    });
  }

  importFunction(module): void {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev) {
    let that = this;
    let workBook = null;
    let jsonData = null;
    let header_;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: "binary" });
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();

        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const keys_OLD = ["cost_code", "division", "description"];
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
        return;
      } else {
        let reqObject = {
          data: jsonData.Sheet1,
          module: 'Invoice',
        };
        that.httpCall
          .httpPostCall(
            httproutes.PORTAL_COMPANY_COSTCODE_XLSX_SAVE,
            reqObject
          )
          .subscribe(function (params) {
            if (params.status) {
              that.openImportChekedData(params);
            } else {
              that.sb.openSnackBar(params.message, "error");
            }
          });
      }
    };
    reader.readAsBinaryString(file);
  }

  openImportChekedData(reqData): void {
    let that = this;
    reqData.module = 'Invoice';
    const dialogRef = this.dialog.open(CostcodeImportData, {
      data: reqData,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      that.rerenderfunc();
    });
  }

  exportFunction(): void {
    let that = this;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_COMPANY_COSTCODE_GET, { module: 'Invoice' })
      .subscribe(async function (params) {
        if (params.status) {
          if (params.data.length == 0) {
            that.sb.openSnackBar(that.Data_Not_Found, "error");
          } else {
            let logo_rovuk = await logobase64();
            let title_tmp = "Invoice Cost Code";
            var company_data = JSON.parse(localStorage.getItem("userdata"));
            let company_logo = company_data.companydata.companylogo;
            try {
              that.sb.openSnackBar(that.Export_file_message, "success");
              that.result = await that.mostusedservice.imageToBase_async(company_logo);

              that.fileCreateXslx(
                params.data,
                title_tmp,
                logo_rovuk,
                company_logo,
                that.result.data,
                "InvoiceCostCode"
              );
            } catch (e) {
              that.fileCreateXslx(
                params.data,
                title_tmp,
                logo_rovuk,
                "",
                "",
                "InvoiceCostCode"
              );
            }
          }
        }
      });
  }


  fileCreateXslx(data, title_tmp, logo_rovuk, company_logo, result, filename) {
    let xlsx_data = [];
    data.forEach((element) => {
      xlsx_data.push([
        element.division,
        element.cost_code,
        element.description,
      ]);
    });
    let headers = [
      this.Settings_Costcode_Division,
      this.Settings_Costcode,
      this.Settings_Costcode_Description,
    ];
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title_tmp);
    //worksheet.mergeCells('C1', 'F4');
    let titleRow = worksheet.getCell("C1");

    titleRow.value = "";
    titleRow.font = {
      name: "Calibri",
      size: 16,
      underline: "single",
      bold: true,
      color: { argb: "0085A3" },
    };
    titleRow.alignment = { vertical: "middle", horizontal: "center" };
    let date = fullDate_format();
    //rovuk logo
    let rovukLogoImage = workbook.addImage({
      base64: logo_rovuk,
      extension: "png",
    });
    worksheet.mergeCells("C1:C4");
    worksheet.addImage(rovukLogoImage, "C1:C4");

    //compnay logo
    if (
      company_logo != "" &&
      company_logo != undefined &&
      company_logo != null
    ) {
      let myLogoImage = workbook.addImage({
        base64: result,
        extension: "png",
      });
      worksheet.addImage(myLogoImage, "A1:A4");
    }

    worksheet.mergeCells("A1:A4");

    let TitleRow = worksheet.addRow([]);
    let titleRowValue = worksheet.getCell("A5");
    titleRowValue.value = title_tmp;
    titleRowValue.font = {
      name: "Calibri",
      size: 16,
      underline: "single",
      bold: true,
    };
    titleRowValue.alignment = { vertical: "middle", horizontal: "center" };
    worksheet.mergeCells(`A${TitleRow.number}:C${TitleRow.number}`);
    //header design
    let headerRow = worksheet.addRow(headers);
    headerRow.height = 50;
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.eachCell((cell, number) => {
      cell.font = {
        bold: true,
        size: 15,
      };
    });

    xlsx_data.forEach((d) => {
      let row = worksheet.addRow(d);
    });
    worksheet.getColumn(3).width = 20;
    worksheet.addRow([]);
    worksheet.columns.forEach(function (column, i) {
      column.width = 20;
    });

    let footerRow = worksheet.addRow([
      title_tmp + " Report Generated  at " + date,
    ]);
    footerRow.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells(`A${footerRow.number}:C${footerRow.number}`);

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.saveAs(blob, filename + new Date().getTime() + ".xlsx");
    });
  }
}

@Component({
  selector: "costcode-form",
  templateUrl: "./costcode-form.component.html",
  styleUrls: ["./cost-code.component.scss"],
})
export class CostCodeFormComponent implements OnInit {
  public costcodesave: FormGroup;
  costcode: any;
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
  other_settings_Form_Submitting: string;

  constructor(
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<CostCodeFormComponent>,
    public translate: TranslateService,
    public uiSpinner: UiSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public httpCall: HttpCall,
    public sb: Snackbarservice
  ) {

    if (data.reqData._id) {
      this.costcodesave = new FormGroup({
        costcode: new FormControl(data.reqData.cost_code),
        division: new FormControl(data.reqData.division),
        description: new FormControl(data.reqData.description),
      });
    } else {
      this.costcodesave = new FormGroup({
        costcode: new FormControl("", [Validators.required]),
        division: new FormControl("", [Validators.required]),
        description: new FormControl(""),
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
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.close_this_window = this.translate.instant("close_this_window");
      this.All_Save_Exit = this.translate.instant("All_Save_Exit");
      this.Dont_Save = this.translate.instant("Dont_Save");
      this.All_popup_Cancel = this.translate.instant("All_popup_Cancel");
      this.other_settings_Form_Submitting = this.translate.instant("other_settings_Form_Submitting");
    });
  }
  ngOnInit() {

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
          // Move to the Users listing
          if (this.costcodesave.valid) {
            this.saveData();
          } else {
            // alert form invalidation
            that.sb.openSnackBar(this.other_settings_Form_Submitting, "error");
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
    if (this.costcodesave.valid) {
      that.uiSpinner.spin$.next(true);
      let reqObject_temp = this.costcodesave.value;
      var reqObject = {
        cost_code: reqObject_temp.costcode,
        division: reqObject_temp.division,
        module: 'Invoice',
        description: reqObject_temp.description,
      };
      if (this.data.reqData._id) {
        reqObject["_id"] = this.data.reqData._id;
      }

      this.httpCall
        .httpPostCall(httproutes.PROJECT_SETTING_COST_CODE_SAVE, reqObject)
        .subscribe(function (params) {
          if (params.status) {
            that.sb.openSnackBar(params.message, "success");
            $("#dtOptions").DataTable().ajax.reload();
            that.uiSpinner.spin$.next(false);
            that.dialogRef.close();
          } else {
            that.sb.openSnackBar(params.message, "error");
            $("#dtOptions").DataTable().ajax.reload();
            that.uiSpinner.spin$.next(false);
          }
        });
    } else {
      // alert form invalidation
      that.sb.openSnackBar(this.other_settings_Form_Submitting, "error");
    }
  }
}

@Component({
  selector: "costcodeimport-data",
  templateUrl: "./costcodeimport-data.html",
  styleUrls: ["./cost-code.component.scss"],
})
export class CostcodeImportData {
  dtOptions: DataTables.Settings = {};
  success_buttons: boolean = false;
  failed_buttons: boolean = false;
  import_cancel_error: any;
  Compnay_Equipment_Delete_Yes: any;
  Compnay_Equipment_Delete_No: any;
  constructor(
    public sb: Snackbarservice,
    public dialogRef: MatDialogRef<CostcodeImportData>,
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translate: TranslateService
  ) {
    this.import_cancel_error = this.translate.instant("import_cancel_error");
    this.Compnay_Equipment_Delete_Yes = this.translate.instant(
      "Compnay_Equipment_Delete_Yes"
    );
    this.Compnay_Equipment_Delete_No = this.translate.instant(
      "Compnay_Equipment_Delete_No"
    );
    dialogRef.disableClose = true;
    if (data.error_data.length >= 1) {
      this.failed_buttons = true;
    } else {
      this.success_buttons = true;
    }
  }
  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem("sitelanguage");
    this.dtOptions = {
      pagingType: "full_numbers",
      language:
        tmp_locallanguage == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
    };
  }
  saveData() {
    let that = this;
    let requestObject = {
      data: this.data.data,
      module: this.data.module,
    };
    this.uiSpinner.spin$.next(true);
    this.httpCall
      .httpPostCall(
        httproutes.PORTAL_CHECK_AND_INSERT_COSTCODE,
        requestObject
      )
      .subscribe(function (params) {
        if (params.status) {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, "success");
          that.dialogRef.close();
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }
  cancelImport() {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.import_cancel_error,
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        that.dialogRef.close();
      });
  }
}