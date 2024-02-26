import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { UserService } from '../user.service';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
  timeDateToepoch,
} from 'src/consts/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { AdvanceTable, RoleModel, UserModel } from '../user.model';
import { UserRestoreFormComponent } from '../user-restore-form/user-restore-form.component';
import { UserReportComponent } from '../user-report/user-report.component';
import {
  FormateDateDDMMYYPipe,
  FormateDateStringPipe,
} from '../users-filter.pipe';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { ImportUserComponent } from '../import-user/import-user.component';
import { UserExistListComponent } from '../user-exist-list/user-exist-list.component';
import * as XLSX from 'xlsx';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { RolePermission } from 'src/consts/common.model';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
  providers: [FormateDateStringPipe],
})
export class UserGridComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  isDelete = 0;
  userList: Array<UserModel> = [];
  activeUserList: Array<UserModel> = [];
  inactiveUserList: Array<UserModel> = [];
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  active_word = 'Active';
  inactive_word = 'Inactive';
  titleMessage = '';
  selection = new SelectionModel<UserModel>(true, []);
  advanceTable?: AdvanceTable;
  roleLists: Array<RoleModel> = [];
  username_search: any;
  username_status: any;
  tweet_epochs: any = [];
  cardLoading = true;
  exitData!: any[];
  role_permission!: RolePermission;
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  constructor (
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonService,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }

  ngOnInit() {
    this.getUser();
  }
  changeStatus(event: any) {
    //
  }

  async getUser() {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE,
      { is_delete: this.isDelete }
    );
    this.userList = data;
    this.activeUserList = this.userList.filter((obj: any) => {
      return obj.userstatus == 1;
    });
    this.inactiveUserList = this.userList.filter((obj: any) => {
      return obj.userstatus == 2;
    });
    this.cardLoading = false;
  }

  convertDate(date: any) {
    return timeDateToepoch(date);
  }

  editUser(user: UserModel) {
    this.router.navigate([WEB_ROUTES.USER_FORM], {
      queryParams: { _id: user._id },
    });

  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.cardLoading = true;
    this.userList = [];
    this.getUser();
  }

  addNewUser() {
    this.router.navigate([WEB_ROUTES.USER_FORM]);
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.USER_HISTORY]);
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

  async getRole() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL
    );
    if (data.status) {
      this.roleLists = data.data;
    }
  }

  refresh() {
    this.getUser();
  }

  async archiveRecover(user: UserModel, is_delete: number) {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_DELETE,
      { _id: user._id, is_delete: is_delete }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.getUser();
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
          this.archiveRecover(user, is_delete);
        }
      });
  }

  addNew(user: UserModel) {
    this.titleMessage = 'Are you sure you want to restore this user?';
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const dialogRef = this.dialog.open(UserRestoreFormComponent, {
            data: user._id,
          });
          this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            if (result === 1) {
            }
          });
        }
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
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
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
      this.refresh();
    });

  }

  gotoUser() {
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.USER]);
  }
}
