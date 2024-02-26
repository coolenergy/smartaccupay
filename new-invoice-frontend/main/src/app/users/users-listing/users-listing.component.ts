import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { RoleModel, UserModel } from './../user.model';
import { UserService } from '../user.service';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { HttpCall } from 'src/app/services/httpcall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { formatPhoneNumber, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { TranslateService } from '@ngx-translate/core';
import { UserRestoreFormComponent } from '../user-restore-form/user-restore-form.component';
import { UserReportComponent } from '../user-report/user-report.component';
import { UntypedFormBuilder } from '@angular/forms';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { TableElement } from 'src/app/shared/TableElement';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { ImportUserComponent } from '../import-user/import-user.component';
import { UserExistListComponent } from '../user-exist-list/user-exist-list.component';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import * as XLSX from 'xlsx';
import { RolePermission } from 'src/consts/common.model';

@Component({
  selector: 'app-users-listing',
  templateUrl: './users-listing.component.html',
  styleUrls: ['./users-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class UsersListingComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['select', 'img', 'userfullname', 'useremail', 'userphone', 'role_name', 'userjob_title_name', 'department_name', 'userstatus', 'actions'];
  userService?: UserService;
  dataSource!: any;
  selection = new SelectionModel<UserModel>(true, []);
  isDelete = 0;
  advanceTable?: UserModel;
  titleMessage = '';
  roleLists: Array<RoleModel> = [];
  userSelectForm?: any;
  selectedValue!: string;
  exitData!: any[];
  role_permission!: RolePermission;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  tableRequest = {
    pageIndex: 0,
    pageSize: 10,
    search: '',
    sort: {
      field: 'userstartdate',
      order: 'desc'
    }
  };
  pager: any = {
    first: 0,
    last: 0,
    total: 10,
  };
  userList!: UserModel[];

  constructor (
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    public userTableService: UserService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private commonService: CommonService,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }

  ngOnInit() {
    this.userSelectForm = this.fb.group({
      userstatus: [''],
    });
    this.getRole();
    let that = this;
    const userDisplay =
      localStorage.getItem(localstorageconstants.USER_DISPLAY) ?? 'list';
    if (userDisplay == 'list') {
      that.loadData();
    } else {
      that.router.navigate([WEB_ROUTES.USER_GRID]);
    }
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.USER_HISTORY]);
  }

  // TOOLTIP
  getEmailTooltip(row: UserModel) {
    return row.useremail;
  }
  getNameTooltip(row: UserModel) {
    return row.userfullname;
  }
  getPhoneTooltip(row: UserModel) {
    return row.userphone;
  }
  getRoleTooltip(row: UserModel) {
    return row.role_name;
  }
  getJobTitleTooltip(row: UserModel) {
    return row.userjob_title_name;
  }
  getDepartmentTooltip(row: UserModel) {
    return row.department_name;
  }

  onBookChange(ob: any) {
    const selectedBook = ob.value;
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to active all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allUserActiveInactve(1);
          }
        });
    } else if (selectedBook == 2) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to Inactive all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allUserActiveInactve(2);
          }
        });
    } else if (selectedBook == 3) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to archive all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allArchiveUser();
          }
        });
    }
  }

  async allArchiveUser() {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_ALL_DELETE,
      { _id: tmp_ids, is_delete: 1 }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.selection.clear();
      this.selectedValue = '';
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allUserActiveInactve(status: number) {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_ALL_USER_STATUS_CHANGE,
      { _id: tmp_ids, userstatus: status }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.selection.clear();
      this.selectedValue = '';
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async updateStatus(user: UserModel) {
    let status = 1;
    if (user.userstatus == 1) {
      status = 2;
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_USER_STATUS_UPDATE,
      { _id: user._id, userstatus: status }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.userService?.dataChange.value.findIndex(
        (x) => x._id === user._id
      );
      if (foundIndex != null && this.userService) {
        this.userService.dataChange.value[foundIndex].userstatus = status;
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userList?.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.userList?.forEach((row: UserModel) => this.selection.select(row));
  }

  userReport() {
    const dialogRef = this.dialog.open(UserReportComponent, {
      width: '700px',
      data: {
        roleList: this.roleLists,
        invoiceStatus: '',
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }

  refresh() {
    this.loadData();
  }

  public changePage(e: any) {
    this.tableRequest.pageIndex = e.pageIndex;
    this.tableRequest.pageSize = e.pageSize;
    this.loadData();
  }

  onSearchChange(event: any) {
    this.tableRequest.search = event.target.value;
    this.tableRequest.pageIndex = 0;
    this.loadData();
  }

  sortData(event: any) {
    if (event.direction == '') {
      this.tableRequest.sort.field = 'userstartdate';
      this.tableRequest.sort.order = 'desc';
    } else {
      this.tableRequest.sort.field = event.active;
      this.tableRequest.sort.order = event.direction;
    }
    this.loadData();
  }

  public async loadData() {
    this.userService = new UserService(this.httpCall);
    const displayDataChanges = [
      this.userService.dataChange,
      this.userService.userPager,
      this.sort.sortChange,
      // this.filterChange,
      this.paginator.page,
    ];
    this.userService.getUserForTable({ is_delete: this.isDelete, start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort });

    this.dataSource = merge(...displayDataChanges).pipe(
      map(() => {
        this.userList = this.userService?.data || [];
        this.pager = this.userService?.pagerData;
        return this.userService?.data.slice();
      })
    );
    this.selection.clear();
  }

  // context menu
  onContextMenu(event: MouseEvent, item: UserModel) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      this.displayedColumns = ['select', 'img', 'userfullname', 'useremail', 'userphone', 'role_name', 'userjob_title_name', 'department_name', 'userstatus', 'actions'];
    } else {
      this.displayedColumns = ['img', 'userfullname', 'useremail', 'userphone', 'role_name', 'userjob_title_name', 'department_name', 'userstatus', 'actions'];
    }
    this.loadData();
  }
  async getRole() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL
    );
    if (data.status) {
      this.roleLists = data.data;
    }
  }

  listToGrid() {
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'grid');
    this.router.navigate([WEB_ROUTES.USER_GRID]);
  }
  async archiveRecover(user: UserModel, is_delete: number) {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_DELETE,
      { _id: user._id, is_delete: is_delete }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.userService?.dataChange.value.findIndex(
        (x) => x._id === user._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.userService) {
        this.userService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteUser(user: UserModel, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = 'Are you sure you want to archive this user?';
    } else {
      this.titleMessage = 'Are you sure you want to restore this user?';
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (is_delete == 1) {
            this.archiveRecover(user, is_delete);
          } else {
            this.addNew(user);
          }
        }
      });
  }

  addNew(user: UserModel) {
    const _id = user._id;
    const dialogRef = this.dialog.open(UserRestoreFormComponent, {
      data: _id,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }
  addNewUser() {
    this.router.navigate([WEB_ROUTES.USER_FORM]);
  }
  editUser(user: UserModel) {

    this.router.navigate([WEB_ROUTES.USER_FORM], {
      queryParams: { _id: user._id },
    });

  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let that = this;
    let workBook: any;
    let jsonData = null;
    let header_;
    const reader = new FileReader();
    const file = ev.target.files[0];
    setTimeout(() => {
      ev.target.value = null;
    }, 200);
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();

        return initial;
      }, {});
      // const dataString = JSON.stringify(jsonData);
      // const keys_OLD = ["item_type_name", "packaging_name", "terms_name"];
      // if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
      //   that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
      //   return;
      // } else {
      const formData_profle = new FormData();
      formData_profle.append('file', file);
      let apiurl = '';


      apiurl = httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_CHECK_IMPORT_TERMS;


      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.exitData = params;
            const dialogRef = that.dialog.open(UserExistListComponent, {
              width: '750px',
              height: '500px',
              // data: that.exitData,
              data: { data: that.exitData },
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              this.loadData();
            });
            // that.openErrorDataDialog(params);

          } else {
            showNotification(that.snackBar, params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      // }
    };
    reader.readAsBinaryString(file);
  }

  downloadImport() {
    const dialogRef = this.dialog.open(ImportUserComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadData();
    });

  }

  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x: UserModel) => ({
        'User Name': x.userfullname || '',
        'Email': x.useremail || '',
        'Phone': this.phonenoFormat(x.userphone) || '',
        'Role': x.role_name || '',
        'Job Title': x.userjob_title_name || '',
        'Department': x.department_name || '',
        'Status': x.userstatus == 1 ? this.translate.instant('COMMON.STATUS.ACTIVE') : this.translate.instant('COMMON.STATUS.INACTIVE') || '',
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }
}

// This class is used for datatable sorting and searching
/* export class UserDataSource extends DataSource<UserModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: UserModel[] = [];
  renderedData: UserModel[] = [];
  pager: Pager = {
    first: 0,
    last: 0,
    total: 10,
  };

  constructor (
    public userService: UserService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public tableRequest: any,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0, this.paginator.pageSize = 10));
  }
    // Connect function called by the table to retrieve one stream containing the data to render. 
  connect(): Observable<UserModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.userService.dataChange,
      this.userService.userPager,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.userService.getUserForTable({ is_delete: this.isDelete, start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort });

    return merge(...displayDataChanges).pipe(
      map(() => {
        this.pager = this.userService.pagerData;
        this.filteredData = this.userService.data.slice();
        // Sort filtered data
        this.renderedData = this.filteredData;
        return this.renderedData;
      })
    );
  }
  disconnect() {
    //disconnect
  }
}
 */