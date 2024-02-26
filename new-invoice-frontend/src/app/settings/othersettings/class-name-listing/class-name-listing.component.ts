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
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { swalWithBootstrapButtons, showNotification } from 'src/consts/utils';
import { ClassNameModel } from '../../settings.model';
import { SettingsService } from '../../settings.service';
import { JobNameFormComponent } from '../job-name-listing/job-name-form/job-name-form.component';
import { ClassNameFormComponent } from './class-name-form/class-name-form.component';
import { icon } from 'src/consts/icon';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-class-name-listing',
  templateUrl: './class-name-listing.component.html',
  styleUrls: ['./class-name-listing.component.scss'],
})
export class ClassNameListingComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['name', 'number', 'description', 'status', 'actions'];
  classnameService?: SettingsService;
  dataSource!: ClassNameDataSource;
  selection = new SelectionModel<ClassNameModel>(true, []);
  id?: number;
  isDelete = 0;
  titleMessage = '';
  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;

  isHideAddActionQBD = false;
  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;

  is_quickbooks_online = false;
  is_quickbooks_desktop = false;

  constructor (
    public dialog: MatDialog,
    public SettingsService: SettingsService,
    private snackBar: MatSnackBar,
    public router: Router,
    private httpCall: HttpCall,
    public translate: TranslateService,
    public commonService: CommonService,
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

      if (data.data.is_quickbooks_online) {
        this.displayedColumns = ['name', 'number', 'description', 'status', 'is_quickbooks', 'actions'];
      } else if (data.data.is_quickbooks_desktop) {
        this.displayedColumns = ['name', 'number', 'description', 'status', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['name', 'number', 'description', 'status', 'actions'];
      }
    }
  }

  refresh() {
    this.loadData();
  }

  edit(className: any) {
    if (!this.isHideEditActionQBD) {
      let that = this;
      const dialogRef = this.dialog.open(ClassNameFormComponent, {
        width: '350px',
        data: className,
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.status) {
            const foundIndex = this.classnameService?.classNameDataChange.value.findIndex((x) => x._id === className._id);
            if (foundIndex != null && this.classnameService) {
              this.classnameService.classNameDataChange.value[foundIndex].name = result.data.name;
              this.classnameService.classNameDataChange.value[foundIndex].number = result.data.number;
              this.classnameService.classNameDataChange.value[foundIndex].description = result.data.description;
              this.classnameService.classNameDataChange.value[foundIndex].status = result.data.status;
              this.refreshTable();
            }
          }
        }
      });
    }
  }

  async delete(className: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.CONFIRMATION_DIALOG.CLASS_NAME'),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_CLASS_NAME, { _id: className._id });
          if (data.status) {
            showNotification(that.snackBar, data.message, 'success');
            const foundIndex = this.classnameService?.classNameDataChange.value.findIndex((x) => x._id === className._id);
            if (foundIndex != null && this.classnameService) {
              this.classnameService.classNameDataChange.value.splice(foundIndex, 1);
              this.refreshTable();
            }
          } else {
            showNotification(that.snackBar, data.message, 'error');
          }
        }
      });
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
    //     this.classnameService?.dataChange.value.splice(index, 1);
    //     this.refreshTable();
    //     this.selection = new SelectionModel<ClassNameModel>(true, []);
    //   });
    //  showNotification(
    //     'snackbar-danger',
    //     totalSelect + ' Record Delete Successfully...!!!',
    //     'bottom',
    //     'center'
    //   );
  }
  public loadData() {
    this.classnameService = new SettingsService(this.httpCall);

    this.dataSource = new ClassNameDataSource(
      this.classnameService,
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

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }

  // context menu
  onContextMenu(event: MouseEvent, item: ClassNameModel) {
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
export class ClassNameDataSource extends DataSource<ClassNameModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: ClassNameModel[] = [];
  renderedData: ClassNameModel[] = [];
  constructor (
    public classnameService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ClassNameModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.classnameService.classNameDataChange,
      this._sort.sortChange,
      this.filterChange,

      this.paginator.page,
    ];
    this.classnameService.getClassNameTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.classnameService.classNameData
          .slice()
          .filter((ClassNameModel: ClassNameModel) => {
            const searchStr =
              ClassNameModel.name +
              ClassNameModel.number +
              ClassNameModel.description.toLowerCase();
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
  sortData(data: ClassNameModel[]): ClassNameModel[] {
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
        case 'name':
          [propertyA, propertyB] = [a.name, b.name];
          break;
        case 'number':
          [propertyA, propertyB] = [a.number, b.number];
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
