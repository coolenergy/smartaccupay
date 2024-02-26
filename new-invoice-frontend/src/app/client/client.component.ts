import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { merge, map } from 'rxjs';
import { WEB_ROUTES } from 'src/consts/routes';
import { swalWithBootstrapTwoButtons, showNotification } from 'src/consts/utils';
import { HttpCall } from '../services/httpcall.service';
import { TableElement } from '../shared/TableElement';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { TableExportUtil } from '../shared/tableExportUtil';
import { VendorReportComponent } from '../vendors/vendor-report/vendor-report.component';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ClientService } from './client.service';
import { ClientJobModel } from './client.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UiSpinnerService } from '../services/ui-spinner.service';
import * as XLSX from 'xlsx';
import { ImportClientComponent } from './import-client/import-client.component';
import { ExitsDataListComponent } from './exits-data-list/exits-data-list.component';
import { icon } from 'src/consts/icon';
import { CommonService } from '../services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';
import { TermModel } from '../settings/settings.model';
import { configData } from 'src/environments/configData';
import { sweetAlert } from 'src/consts/sweet_alert';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class ClientComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
  clientService?: ClientService;
  dataSource!: any;
  selection = new SelectionModel<ClientJobModel>(true, []);
  id?: number;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage = '';
  isQBSyncedCompany = false;
  rform?: any;
  selectedValue!: string;
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  role_permission!: RolePermission;

  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;
  is_quickbooks_online = false;
  is_quickbooks_desktop = false;

  isHideAddActionQBD = false;
  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;

  tableRequest = {
    pageIndex: 0,
    pageSize: 10,
    search: '',
    sort: {
      field: 'created_at',
      order: 'desc'
    }
  };
  pager: any = {
    first: 0,
    last: 0,
    total: 10,
  };
  clientJobList!: ClientJobModel[];

  constructor (
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public clientTableService: ClientService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    public uiSpinner: UiSpinnerService,
    private commonService: CommonService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  client_status: any = [''];

  ngOnInit() {
    this.rform = this.fb.group({
      client_status: [''],
    });
    this.loadData();
    this.getCompanyTenants();
    this.getTerms();
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {

      if (data.data.is_quickbooks_desktop) {
        if (this.role_permission.clientJob.Add) {
          this.isHideAddActionQBD = true;
        } else {
          this.isHideAddActionQBD = false;
        }

        if (this.role_permission.clientJob.Edit) {
          this.isHideEditActionQBD = true;
        } else {
          this.isHideEditActionQBD = false;
        }

        if (this.role_permission.clientJob.Delete) {
          this.isHideArchiveActionQBD = true;
        } else {
          this.isHideArchiveActionQBD = false;
        }
      }
      this.is_quickbooks_online = data.data.is_quickbooks_online;
      this.is_quickbooks_desktop = data.data.is_quickbooks_desktop;
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    }
  }

  // TOOLTIPS
  getTooltip(row: ClientJobModel) {
    return row.client_email;
  }
  getNameTooltip(row: ClientJobModel) {
    return row.client_name;
  }
  getCostCodeTooltip(row: ClientJobModel) {
    return row.client_cost_cost?.cost_code;
  }
  getNumberTooltip(row: ClientJobModel) {
    return row.client_number;
  }
  getApproverTooltip(row: ClientJobModel) {
    return row.approver?.userfullname;
  }

  refresh() {
    this.loadData();
  }

  onBookChange(ob: any) {
    const selectedBook = ob.value;
    console.log(selectedBook);
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ALL_ACTIVE'),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
          background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
          color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allActiveInactive(1);
          }
        });
    } else if (selectedBook == 2) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ALL_INACTIVE'),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
          background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
          color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allActiveInactive(2);
          }
        });
    } else if (selectedBook == 3) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ALL_ARCHIVE'),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
          background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
          color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allArchive();
          }
        });
    }
  }

  async allArchive() {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_DELETE, { _id: tmp_ids, is_delete: 1 });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();

    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allActiveInactive(status: number) {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_UPDATE_ALL_STATUS, { _id: tmp_ids, client_status: status });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.selection.clear();
      this.selectedValue = '';
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  addNew() {
    this.router.navigate([WEB_ROUTES.CLIENT_FORM]);
  }

  editClient(client: ClientJobModel) {
    this.router.navigate([WEB_ROUTES.CLIENT_FORM], { queryParams: { _id: client._id } });
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.CLIENT_HISTORY]);
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.clientJobList?.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.clientJobList?.forEach((row) => this.selection.select(row));
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
      this.tableRequest.sort.field = 'created_at';
      this.tableRequest.sort.order = 'desc';
    } else {
      this.tableRequest.sort.field = event.active;
      this.tableRequest.sort.order = event.direction;
    }
    this.loadData();
  }

  public loadData() {
    this.clientService = new ClientService(this.httpCall);
    const displayDataChanges = [
      this.clientService.dataChange,
      this.clientService.clientJobPager,
      this.sort.sortChange,
      this.paginator.page,
    ];
    this.clientService.getClientTable({ is_delete: this.isDelete, start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort });

    this.dataSource = merge(...displayDataChanges).pipe(
      map(() => {
        this.clientJobList = this.clientService?.data || [];
        this.pager = this.clientService?.pagerData;
        return this.clientService?.data.slice();
      })
    );
    this.selection.clear();
    // this.show = true;
  }

  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.clientJobList.map((x: ClientJobModel) => ({
        'Client/Job Name': x.client_name || '',
        'Client Number': x.client_number || '',
        'Job Contact Email': x.client_email || '',
        'Approver': x.approver?.userfullname || '',
        'Job Cost Code/GL Account': x.client_cost_cost?.value || '',
        'Status': x.client_status == 1 ? this.translate.instant('COMMON.STATUS.ACTIVE') : this.translate.instant('COMMON.STATUS.INACTIVE') || '',
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  // context menu
  onContextMenu(event: MouseEvent, item: ClientJobModel) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
  async updateStatus(client: ClientJobModel) {
    let status = 1;
    if (client.client_status == 1) {
      status = 2;
    }
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_UPDATE_STATUS, { _id: client._id, client_status: status });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.clientService?.dataChange.value.findIndex(
        (x) => x._id === client._id
      );
      if (foundIndex != null && this.clientService) {
        this.clientService.dataChange.value[foundIndex].client_status = status;
        // this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async archiveRecover(client: ClientJobModel, is_delete: number) {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_DELETE, { _id: client._id, is_delete: is_delete });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.clientService?.dataChange.value.findIndex(
        (x) => x._id === client._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.clientService) {
        this.clientService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteClient(client: ClientJobModel, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.RESTORE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.archiveRecover(client, is_delete);
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    } else {
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    }
    this.refresh();
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let workBook: any;
    let jsonData = null;
    let header: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = async (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header = data.shift();
        return initial;
      }, {});
      let that = this;
      const keys_OLD = configData.EXCEL_HEADER.CLIENT;
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header.sort())) {
        showNotification(that.snackBar, this.translate.instant('COMMON.IMPORT.INVALID_EXCEL'), 'error');
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append('file', file);
        that.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CHECK_IMPORT_CLIENT, formData_profle);
        that.uiSpinner.spin$.next(false);
        if (data.status) {
          const dialogRef = that.dialog.open(ExitsDataListComponent, {
            width: '750px',
            height: '500px',
            data: data,
            disableClose: true,
          });

          dialogRef.afterClosed().subscribe((result: any) => {
            // this.getDataTerms();
            that.loadData();
          });
        } else {
          showNotification(that.snackBar, data.message, 'error');
          that.uiSpinner.spin$.next(false);
        }
      }
    };
    reader.readAsBinaryString(file);
  }
  downloadImport() {
    const dialogRef = this.dialog.open(ImportClientComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // this.getDataTerms();
      this.loadData();
    });
  }


  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.termsList = data.data;
    }
  }

  vendorReport() {
    const dialogRef = this.dialog.open(VendorReportComponent, {
      width: '700px',
      data: {
        termsList: this.termsList,
        invoiceStatus: '',
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }
} 