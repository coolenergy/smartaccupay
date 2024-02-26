import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, BehaviorSubject, Observable, merge, map } from 'rxjs';
import { HttpCall } from 'src/app/services/httpcall.service';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { SettingsService } from '../settings.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { CostCodeModel } from '../settings.model';
import { CostCodeFormComponent } from './cost-code-form/cost-code-form.component';
import { ImportCostcodeSettingsComponent } from './import-costcode-settings/import-costcode-settings.component';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import * as XLSX from 'xlsx';
import { icon } from 'src/consts/icon';
import { CommonService } from 'src/app/services/common.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';
import { CostcodeExistListComponent } from './costcode-exist-list/costcode-exist-list.component';
import { configData } from 'src/environments/configData';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-costcode',
  templateUrl: './costcode.component.html',
  styleUrls: ['./costcode.component.scss'],
})
export class CostcodeComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['division', 'value', 'description', 'actions'];
  costcodeService?: SettingsService;
  dataSource!: CostCodeDataSource;
  selection = new SelectionModel<CostCodeModel>(true, []);
  id?: number;
  isDelete = 0;
  titleMessage = '';
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;

  isHideAddActionQBD = false;
  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;

  is_quickbooks_online = false;
  is_quickbooks_desktop = false;
  role_permission!: RolePermission;
  exitData!: any[];

  constructor (
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public router: Router,
    private httpCall: HttpCall,
    public translate: TranslateService,
    public uiSpinner: UiSpinnerService,
    private commonService: CommonService,
    public SettingsService: SettingsService,
  ) {
    super();
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  ngOnInit() {
    this.loadData();
    this.getCompanyTenants();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      if (data.data.is_quickbooks_desktop) {
        this.isHideAddActionQBD = true;
        this.isHideEditActionQBD = true;
        this.isHideArchiveActionQBD = true;
      } else {
        this.isHideAddActionQBD = false;
        this.isHideEditActionQBD = false;
        this.isHideArchiveActionQBD = false;
      }

      this.is_quickbooks_online = data.data.is_quickbooks_online;
      this.is_quickbooks_desktop = data.data.is_quickbooks_desktop;

      if (this.is_quickbooks_online) {
        this.displayedColumns = ['division', 'value', 'description', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['division', 'value', 'description', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['division', 'value', 'description', 'actions'];
      }
    }
  }

  refresh() {
    this.loadData();
  }

  async deleteCostCode(costcodeTable: CostCodeModel, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE_MODULE.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE_MODULE.CONFIRMATION_DIALOG.RESTORE'
      );
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
          this.archiveRecover(costcodeTable, is_delete);
        }
      });
  }

  async archiveRecover(costcodeTable: CostCodeModel, is_delete: number) {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_COST_CODE, { _id: costcodeTable._id, is_delete: is_delete });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.costcodeService?.costCodeDataChange.value.findIndex((x) => x._id === costcodeTable._id);
      if (foundIndex != null && this.costcodeService) {
        this.costcodeService.costCodeDataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.loadData();
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) =>
        this.selection.select(row)
      );
  }

  add() {
    const dialogRef = this.dialog.open(CostCodeFormComponent, {
      width: '350px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  edit(costcode: any) {
    if (!this.isHideEditActionQBD) {
      if (this.isDelete == 0) {
        const dialogRef = this.dialog.open(CostCodeFormComponent, {
          width: '350px',
          data: costcode,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (result.status) {
              const foundIndex = this.costcodeService?.costCodeDataChange.value.findIndex((x) => x._id === costcode._id);
              if (foundIndex != null && this.costcodeService) {
                this.costcodeService.costCodeDataChange.value[foundIndex].cost_code = result.data.cost_code;
                this.costcodeService.costCodeDataChange.value[foundIndex].division = result.data.division;
                this.costcodeService.costCodeDataChange.value[foundIndex].value = `Invoice-${result.data.division}-${result.data.cost_code}`;
                this.costcodeService.costCodeDataChange.value[foundIndex].description = result.data.description;
                this.refreshTable();
              }
            }
          }
        });
      }
    }
  }

  public loadData() {
    this.costcodeService = new SettingsService(this.httpCall);
    this.dataSource = new CostCodeDataSource(
      this.costcodeService,
      this.paginator,
      this.sort,
      this.isDelete
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }


  onFileChange(ev: any) {
    let that = this;
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
      const keys_OLD = configData.EXCEL_HEADER.COST_CODE;
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header.sort())) {
        showNotification(that.snackBar, this.translate.instant('COMMON.IMPORT.INVALID_EXCEL'), 'error');
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append('file', file);
        that.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTINGS_CHECk_IMPORT_COSTCODE_DATA, formData_profle);
        that.uiSpinner.spin$.next(false);
        if (data.status) {
          that.exitData = data;
          const dialogRef = that.dialog.open(CostcodeExistListComponent, {
            width: '750px',
            height: '500px',
            // data: that.exitData,
            data: { data: that.exitData },
            disableClose: true,
          });

          dialogRef.afterClosed().subscribe((result: any) => {
            that.refresh();
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
    const dialogRef = this.dialog.open(ImportCostcodeSettingsComponent, {
      width: '500px',
      data: '',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => { });
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }

  // context menu
  onContextMenu(event: MouseEvent, item: CostCodeModel) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
export class CostCodeDataSource extends DataSource<CostCodeModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: CostCodeModel[] = [];
  renderedData: CostCodeModel[] = [];
  constructor (
    public costcodeTableService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CostCodeModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.costcodeTableService.costCodeDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];

    this.costcodeTableService.getCostCodeTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data

        this.filteredData = this.costcodeTableService.costCodeData
          .slice()
          .filter((costcodeTable: CostCodeModel) => {
            const searchStr = (
              costcodeTable.division +
              costcodeTable.value +
              costcodeTable.description
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() {
    //disconnect
  }
  /** Returns a sorted copy of the database data. */
  sortData(data: CostCodeModel[]): CostCodeModel[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'divison':
          [propertyA, propertyB] = [a.division, b.division];
          break;
        case 'value':
          [propertyA, propertyB] = [a.value, b.value];
          break;
        case 'description':
          [propertyA, propertyB] = [a.description, b.description];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
