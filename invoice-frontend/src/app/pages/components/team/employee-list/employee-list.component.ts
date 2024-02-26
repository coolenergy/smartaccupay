import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core'; public;
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Mostusedservice } from './../../../../service/mostused.service';
import Swal from 'sweetalert2';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { formatPhoneNumber, LanguageApp, MMDDYYYY_formet } from 'src/app/service/utils';
import 'datatables.net-responsive';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { configdata } from 'src/environments/configData';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { ModeDetectService } from '../../map/mode-detect.service';
import { saveAs } from 'file-saver';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'

});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})

export class EmployeeListComponent implements OnInit {
  isManagement: boolean = true;
  usersArray: any;
  isEmployeeData: Boolean = false;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  sorting_asc: Boolean = false;
  sorting_desc: Boolean = false;
  soruing_all: Boolean = true;
  username_search: any;
  username_status: any;
  gridtolist: Boolean = true;
  addTeamMember: boolean = true;
  deleteTeamMember: boolean = true;
  locallanguage: any;

  dtOptions: DataTables.Settings = {};
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  mode: any;
  subscription: Subscription;
  historyIcon: string;
  trashIcon: string;
  importIcon: string;
  editIcon: string;
  reportIcon: string;
  role_to: any;
  archivedIcon!: string;
  allRoles = [];
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  listIcon!: string;
  gridIcon: string;
  role_permission: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  constructor(private modeService: ModeDetectService, private router: Router, public mostusedservice: Mostusedservice,
    public employeeservice: EmployeeService, public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService,) {
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);

    let tmp_gridtolist_team = localStorage.getItem("gridtolist_team");
    this.gridtolist =
      tmp_gridtolist_team == "grid" || tmp_gridtolist_team == null
        ? true
        : false;
    this.role_permission = userdata.role_permission.users;

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.historyIcon = icon.HISTORY;
      this.archivedIcon = icon.ARCHIVE;
      this.gridIcon = icon.GRID;
      this.listIcon = icon.List;
      this.trashIcon = icon.DELETE;
      this.importIcon = icon.IMPORT;

      this.editIcon = icon.EDIT;
      this.reportIcon = icon.REPORT;
    } else {
      this.historyIcon = icon.HISTORY_WHITE;
      this.archivedIcon = icon.ARCHIVE_WHITE;
      this.trashIcon = icon.DELETE_WHITE;
      this.importIcon = icon.IMPORT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.reportIcon = icon.REPORT_WHITE;
      this.gridIcon = icon.GRID_WHITE;
      this.listIcon = icon.List_LIGHT;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.historyIcon = icon.HISTORY;
        this.archivedIcon = icon.ARCHIVE;
        this.trashIcon = icon.DELETE;
        this.importIcon = icon.IMPORT;
        this.editIcon = icon.EDIT;
        this.reportIcon = icon.REPORT;
        this.gridIcon = icon.GRID;
        this.listIcon = icon.List;
      } else {
        this.mode = 'on';
        this.historyIcon = icon.HISTORY_WHITE;
        this.archivedIcon = icon.ARCHIVE_WHITE;
        this.trashIcon = icon.DELETE_WHITE;
        this.importIcon = icon.IMPORT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.reportIcon = icon.REPORT_WHITE;
        this.gridIcon = icon.GRID_WHITE;
        this.listIcon = icon.List_LIGHT;
      }
      this.rerenderfunc();
    });
    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.Company_Equipment_File_Not_Match = this.translate.instant('Company_Equipment_File_Not_Match');
    });

  }

  ngOnInit(): void {

    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');

    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');

    this.role_to = role_permission.UserData.role_name;

    this.uiSpinner.spin$.next(true);
    let that = this;

    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      that.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      that.inacticve_word = this.translate.instant('project_setting_inactive');

      that.translate.get('Employee-List-list-to-grid').subscribe((text: string) => {
        that.listtogrid_text = text;
      });

      that.translate.get('Employee-List-grid-to-list').subscribe((text: string) => {
        that.gridtolist_text = text; that.btn_grid_list_text = text;
      });

      if (this.locallanguage === 'en') {
        this.locallanguage = 'es';
      } else {
        this.locallanguage = 'en';
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 1000);
      }
      i++;
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables
    };
    this.employeeservice.getalluser().subscribe(function (data) {
      that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        that.usersArray = data.data;
        that.isManagement = data.is_management;
      }
    });

    this.mostusedservice.deleteUserEmit$.subscribe(function (editdata) {
      that.employeeservice.getalluser().subscribe(function (data) {
        if (data.status) {
          that.isEmployeeData = true;
          that.usersArray = data.data;
        }
      });
    });

    this.getAllRoles();
  }

  rerenderfunc() {
    this.isEmployeeData = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.isEmployeeData = true;
    }, 100);
  }
  gotoArchive() {
    this.router.navigateByUrl('/archive-team-list');
  }


  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  btnClick() {
    this.router.navigateByUrl('/employee-form');
  }

  openManagementUserDialog() {
    let that = this;
    const dialogRef = this.dialog.open(ExportManagementUserComponent, {
      height: "550px",
      width: "750px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      that.employeeservice.getalluser().subscribe(function (data) {
        if (data.status) {
          that.usersArray = data.data;
          that.isManagement = data.is_management;
        }
      });
    });
  }

  viewpageoprn(id: any) {
    this.router.navigateByUrl('/employee-view/' + id);
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  gridTolist() {
    if (this.gridtolist) {
      this.rerenderfunc();
      this.btn_grid_list_text = this.listtogrid_text;
      localStorage.setItem('gridtolist_team', "list");
      this.gridtolist = false;
    } else {
      this.btn_grid_list_text = this.gridtolist_text;
      localStorage.setItem('gridtolist_team', "grid");
      this.gridtolist = true;
    }
  }

  sorting_name() {
    if (this.sorting_desc) {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    } else if (this.sorting_asc) {
      this.sorting_desc = true;
      this.sorting_asc = false;
      this.soruing_all = false;
      this.usersArray = this.usersArray.reverse((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));

    } else {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    }
  }

  searchData(searchValue: any) {
    this.usersArray = this.usersArray.filter((item: any) => {
      return item.username.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  deleteTimecardButtonClick(id: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: that.User_Card_Do_Want_Delete,
      allowOutsideClick: false,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpCall.httpPostCall(httproutes.TEAM_DELETE, { _id: id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.mostusedservice.userdeleteEmit();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  openHistoryDialog() {
    const dialogRef = this.dialog.open(TeamHistory, {
      height: '500px',
      width: '800px',
      data: {
        employee_id: ""
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }

  openReportDialog() {
    const dialogRef = this.dialog.open(TeamReportForm, {
      height: '500px',
      width: '800px',
      data: {
        allRoles: this.allRoles
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openForImportDownloadDialog() {
    const dialogRef = this.dialog.open(ImportButtonDownload, {
      disableClose: true

    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openErrorDataDialog(data: any) {
    let that = this;
    const dialogRef = this.dialog.open(BulkUploadErrorData, {
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      that.mostusedservice.userdeleteEmit();
    });
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  onFileChange(ev: any) {
    let that = this;
    let workBook: any = null;
    let jsonData = null;
    let header_: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = (XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        header_ = data.shift();

        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);

      const keys_OLD = ["userfirstname", "userlastname", "useremail", "password", "user_role", "usergender", "userdepartment", "userjob_title", "userjob_type"];
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.snackbarservice.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
        return;
      } else {
        that.uiSpinner.spin$.next(true);
        const formData_profle = new FormData();
        formData_profle.append("file", file);
        that.httpCall.httpPostCall(httproutes.PORTAL_EMPLOYEE_IMPORT, formData_profle).subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.openErrorDataDialog(params);
            that.mostusedservice.userdeleteEmit();
            //that.snackbarservice.openSnackBar(params.message, "success");
            //that.rerenderfunc();
          } else {
            that.uiSpinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    };
    reader.readAsBinaryString(file);
  }

}


@Component({
  selector: 'team-history',
  templateUrl: './team-history.component.html',
  styleUrls: ['./employee-list.component.scss']
})

export class TeamHistory {
  id!: string;
  taskHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  mode: any;
  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;

  activityIcon!: string;
  isSearch: boolean = false;
  subscription: Subscription;
  constructor(
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    private modeService: ModeDetectService
  ) {

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
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
  }

  ngOnInit(): void {
    // this.getAllHistory();
    this.getTodaysActivity();
  }

  onKey(event: any) {

    if (event.target.value.length == 0) {

      this.taskHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }

  searchActivity() {

    let that = this;
    that.isSearch = true;
    that.taskHistory = [];
    that.start = 0;
    this.getTodaysActivity();
  }

  onScroll() {
    this.start++;
    this.getTodaysActivity();
  }
  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;


    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_TEAM_NEW_HISTORY, {
        start: this.start,
        search: this.todayactivity_search,
      })
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            //self.uiSpinner.spin$.next(false)
            self.is_httpCall = false;
          self.taskHistory = self.taskHistory.concat(params.data);
        }
      });
  }



  tmp_date(epoch: any) {
    return MMDDYYYY_formet(epoch);
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }

}

/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 * 
 * as per task and discussion need to display error data in dialog and
 * need give skip and correct button
 * 
 * 
 */

@Component({
  selector: 'bulkupload-errordata',
  templateUrl: './bulkupload-errordata.html',
  styleUrls: ['./employee-list.component.scss']
})

export class BulkUploadErrorData {
  dtOptions: DataTables.Settings = {};
  success_buttons: boolean = false;
  failed_buttons: boolean = false;
  import_cancel_error: string;
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  constructor(
    public dialogRef: MatDialogRef<BulkUploadErrorData>, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService) {
    this.import_cancel_error = this.translate.instant('import_cancel_error');
    this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
    this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
    dialogRef.disableClose = true;
    if (data.error_data.length >= 1) {
      this.failed_buttons = true;
    } else {
      this.success_buttons = true;
    }
  }

  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };
  }

  saveData() {
    let that = this;
    let requestObject = {
      data: this.data.data
    };
    this.uiSpinner.spin$.next(true);
    this.httpCall.httpPostCall(httproutes.PORTAL_CHECK_AND_INSERT, requestObject).subscribe(function (params) {
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
    swalWithBootstrapButtons.fire({
      title: this.import_cancel_error,
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      this.dialogRef.close();
    });
  }

}


/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 * 
 * Import file button click 
 * open dialog and display instruction for download button for file
 * 
 */

@Component({
  selector: 'importbutton-download',
  templateUrl: './importbutton-download.html',
  styleUrls: ['./employee-list.component.scss']
})

export class ImportButtonDownload {
  dtOptions: DataTables.Settings = {};

  constructor(
    public dialogRef: MatDialogRef<ImportButtonDownload>,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService) {
  }

  downloadImportTemplate() {
    this.dialogRef.close();
    return saveAs('./assets/files/user.xlsx', "user.xlsx");
  }
}

/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 *
 * Team Report Component
   Team Report form
 *
 */

@Component({
  selector: 'teamreport-form',
  templateUrl: './teamreport-form.html',
  styleUrls: ['./employee-list.component.scss']
})

export class TeamReportForm {
  is_oneOnly: boolean = true;
  public form: any;
  public rolesList = [];
  selectedRoles: any;
  public statusList = configdata.superAdminStatus;
  selectedStatus: any;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });
  timecardinfo: FormGroup;
  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;

  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<TeamReportForm>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService) {


    this.Report_File_Message = this.translate.instant('Report_File_Message');
    this.Report_File_Enter_Email = this.translate.instant('Report_File_Enter_Email');
    this.rolesList = data.allRoles;
    this.timecardinfo = this.formBuilder.group({
      All_Roles: [true],
      role_ids: [this.rolesList.map((el: any) => el.role_id)],
      All_Status: [true],
      status_ids: [this.statusList.map((el: any) => el.value)],
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;

      }


    });

  }

  isValidMailFormat(value: any) {
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (value != "" && (EMAIL_REGEXP.test(value))) {
      return { "Please provide a valid email": true };
    }
    return null;
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add email
    if (value) {
      var validEmail = this.isValidMailFormat(value);
      if (validEmail) {
        this.emailsList.push(value);
        // Clear the input value
        event.chipInput!.clear();
      } else {
        // here error for valid email
      }
    }
  }

  internalEmailremove(email: any): void {
    //----
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    //----
    const index = this.emailsList.indexOf(email);
    if (index >= 0) {
      this.emailsList.splice(index, 1);
      //----
      if (email == user_data.UserData.useremail) {
        this.is_oneOnly = true;
      }
      //----
    }
  }

  ngOnInit(): void {
    let that = this;
    this.timecardinfo.get("role_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.rolesList.length) {
        that.timecardinfo.get("All_Roles")!.setValue(true);
      } else {
        that.timecardinfo.get("All_Roles")!.setValue(false);
      }
    });
    this.timecardinfo.get("status_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.statusList.length) {
        that.timecardinfo.get("All_Status")!.setValue(true);
      } else {
        that.timecardinfo.get("All_Status")!.setValue(false);
      }
    });
  }

  onChangeValueAll_Roles(params: any) {
    if (params.checked) {
      this.timecardinfo.get("role_ids")!.setValue(this.rolesList.map((el: any) => el.role_id));
    } else {
      this.timecardinfo.get("role_ids")!.setValue([]);
    }
  }

  onChangeValueAll_Status(params: any) {
    if (params.checked) {
      this.timecardinfo.get("status_ids")!.setValue(this.statusList.map(el => el.value));
    } else {
      this.timecardinfo.get("status_ids")!.setValue([]);
    }
  }

  saveData() {
    if (this.emailsList.length != 0) {
      this.sb.openSnackBar(this.Report_File_Message, "success");
      let requestObject = this.timecardinfo.value;
      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      requestObject.email_list = this.emailsList;
      requestObject.logo_url = company_data.companydata.companylogo;

      this.httpCall.httpPostCall(httproutes.PORTAL_EMPLOYEE_REPORT, requestObject).subscribe(function (params: any) { });
      setTimeout(() => {
        this.dialogRef.close();
      }, 3000);
    } else {
      this.sb.openSnackBar(this.Report_File_Enter_Email, "error");
    }
  }
  addmyself() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }
}

@Component({
  selector: 'export-management-user',
  templateUrl: './export-management-user.html',
  styleUrls: ['./employee-list.component.scss']
})

export class ExportManagementUserComponent {
  exitIcon: string;
  mode: any;
  subscription: Subscription;
  userList!: any[];
  allRoles!: any[];
  showLoader: boolean = true;
  gifLoader: string = '';
  selectedUserList: any = [];
  newUserList: any = [];
  Import_Management_User_Missing_Role: string = '';
  UserLimitExceed: string = '';
  user_search: any;

  constructor(
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<ExportManagementUserComponent>,
    public mostusedservice: Mostusedservice,
    public httpCall: HttpCall,
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
  ) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
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
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    tmp_locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      this.Import_Management_User_Missing_Role = this.translate.instant('Import_Management_User_Missing_Role');
      this.UserLimitExceed = this.translate.instant('UserLimitExceed');
    });

    this.userList = data?.reqData;
    this.gifLoader = this.httpCall.getLoader();
  }

  ngOnInit(): void {
    this.getAllUserList();
    this.getAllRoles();

  }
  async getAllUserList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_GET_MANAGEMENT_USERS).toPromise();
    if (data.status) {
      var index = 0;
      this.userList = [];
      data.data.forEach((element: any) => {
        this.newUserList.push({ check: false, _id: element._id, index: index, role_id: '', role_name: '' });
        var tempObj = {
          ...element,
          index: index,
        };
        this.userList.push(tempObj);
        index++;
      });
      this.showLoader = false;
    }
  }
  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }

  checkboxChange(i: any, user: any) {
    this.newUserList[i].check = !this.newUserList[i].check;
  }

  selectRole(event: any, i: any) {
    let one_role = _.find(this.allRoles, function (n: any) { return n.role_id == event.value; });
    this.newUserList[i].role_id = one_role.role_id;
    this.newUserList[i].role_name = one_role.role_name;
  }

  importFromManagement() {
    let that = this;
    let final_users = _.filter(that.newUserList, function (p) {
      return p.check == true;
    });
    let checkInvalid = _.find(final_users, function (n: any) { return n.role_id == ""; });
    if (checkInvalid) {
      that.snackbarservice.openSnackBar(that.Import_Management_User_Missing_Role, "error");
    } else {
      that.uiSpinner.spin$.next(true);
      let requestObject = {
        users: final_users
      };
      that.httpCall.httpPostCall(httproutes.PORTAL_IMPORT_MANAGEMENT_USERS, requestObject).subscribe(function (params: any) {
        if (params.status) {
          that.dialogRef.close();
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });

    }
  }
}