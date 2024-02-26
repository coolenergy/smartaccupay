import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, Observable, map, merge } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { UsageModel } from '../settings.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss'],
})
export class UsageComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['month_name', 'invoice', 'po', 'packing_slip', 'receiving_slip', 'quote', 'other', 'duplicated'];

  AllUsage: any;
  usageinfo: FormGroup;

  usageService?: SettingsService;
  dataSource!: UsageDataSource;
  selection = new SelectionModel<UsageModel>(true, []);
  id?: number;
  isDelete = 0;
  titleMessage = '';

  constructor (
    public SettingsService: SettingsService,
    public router: Router,
    public translate: TranslateService,
    public httpCall: HttpCall,
    private formBuilder: FormBuilder,
    public uiSpinner: UiSpinnerService,
    private snackBar: MatSnackBar
  ) {
    super();

    this.usageinfo = this.formBuilder.group({
      totalSuervisor: [''],
      bucket_size: [''],
    });
    this.getcompanyusage();
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }

  ngOnInit() {
    let that = this;
    this.loadData();
    that.getcompanyusage();
  }

  async getcompanyusage() {
    let that = this;
    // that.uiSpinner.spin$.next(true);
    that.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_USEAGE)
      .subscribe(function (params) {
        if (params.status) {
          // that.uiSpinner.spin$.next(false);
          that.usageinfo = that.formBuilder.group({
            totalSuervisor: [params.data.totalSuervisor],
            bucket_size: [params.data.bucket_size],
          });
        }
      });
  }
  refresh() {
    this.loadData();
  }

  async archiveRecover(mailbox: UsageModel, is_delete: number) {
    const data = await this.SettingsService.deleteMailbox({
      _id: mailbox._id,
      is_delete: is_delete,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.SettingsService?.dataChange.value.findIndex(
        (x) => x._id === mailbox._id
      );

      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.SettingsService) {
        this.SettingsService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
        location.reload();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteMailbox(mailbox: UsageModel, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOX.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOX.CONFIRMATION_DIALOG.RESTORE'
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
          this.archiveRecover(mailbox, is_delete);
        }
      });
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
  removeSelectedRows() {
    //   const totalSelect = this.selection.selected.length;
    //   this.selection.selected.forEach((item) => {
    //     const index: number = this.dataSource.renderedData.findIndex(
    //       (d) => d === item
    //     );
    //     // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
    //     this.usageService?.dataChange.value.splice(index, 1);
    //     this.refreshTable();
    //     this.selection = new SelectionModel<UsageModel>(true, []);
    //   });
    //  showNotification(
    //     'snackbar-danger',
    //     totalSelect + ' Record Delete Successfully...!!!',
    //     'bottom',
    //     'center'
    //   );
  }
  public loadData() {
    this.usageService = new SettingsService(this.httpCall);
    this.dataSource = new UsageDataSource(
      this.usageService,
      this.paginator,
      this.sort,
      this.isDelete
    );
    /* this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    ); */
  }

  // context menu
  onContextMenu(event: MouseEvent, item: UsageModel) {
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

export class UsageDataSource extends DataSource<UsageModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: UsageModel[] = [];
  renderedData: UsageModel[] = [];
  constructor (
    public usageService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<UsageModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.usageService.aPCountDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.usageService.getAPCount();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.usageService.aPCountData
          .slice()
          .filter((response: UsageModel) => {
            const searchStr = response._id.toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });

        this.filteredData = this.filteredData.map((element) => ({
          ...element,
          isExpanded: false,
        }));
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
  sortData(data: UsageModel[]): UsageModel[] {
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
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
} 
