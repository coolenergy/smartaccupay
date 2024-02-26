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
import { RelationshipModel } from '../../settings.model';
import { SettingsService } from '../../settings.service';
import { RelationshipFormComponent } from './relationship-form/relationship-form.component';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-relationship-list',
  templateUrl: './relationship-list.component.html',
  styleUrls: ['./relationship-list.component.scss'],
})
export class RelationshipListComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['relationship_name', 'actions'];
  relationshipService?: SettingsService;
  dataSource!: RelationshipDataSource;
  selection = new SelectionModel<RelationshipModel>(true, []);
  id?: number;
  // advanceTable?: RelationshipModel;
  isDelete = 0;
  titleMessage = '';

  constructor (public dialog: MatDialog, public SettingsService: SettingsService, private snackBar: MatSnackBar,
    public router: Router, private httpCall: HttpCall, public translate: TranslateService, private commonService: CommonService,) {
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
  }
  refresh() {
    this.loadData();
  }

  edit(relationship: any) {
    let that = this;
    const dialogRef = this.dialog.open(RelationshipFormComponent, {
      width: '350px',
      data: relationship,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.status) {
          const foundIndex = this.relationshipService?.relationshipDataChange.value.findIndex((x) => x._id === relationship._id);
          if (foundIndex != null && this.relationshipService) {
            this.relationshipService.relationshipDataChange.value[foundIndex].relationship_name = result.data;
            this.refreshTable();
          }
        }
      }
    });
  }

  async delete(relationship: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.RELATIONSHIP'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTING_RELATIONSHIP_DELETE, { _id: relationship._id });
          if (data.status) {
            showNotification(that.snackBar, data.message, 'success');
            const foundIndex = this.relationshipService?.relationshipDataChange.value.findIndex(
              (x) => x._id === relationship._id
            );
            if (foundIndex != null && this.relationshipService) {
              this.relationshipService.relationshipDataChange.value.splice(foundIndex, 1);
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
    //     this.relationshipService?.dataChange.value.splice(index, 1);
    //     this.refreshTable();
    //     this.selection = new SelectionModel<RelationshipModel>(true, []);
    //   });
    //  showNotification(
    //     'snackbar-danger',
    //     totalSelect + ' Record Delete Successfully...!!!',
    //     'bottom',
    //     'center'
    //   );
  }
  public loadData() {
    this.relationshipService = new SettingsService(this.httpCall);
    this.dataSource = new RelationshipDataSource(
      this.relationshipService,
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
  onContextMenu(event: MouseEvent, item: RelationshipModel) {
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
export class RelationshipDataSource extends DataSource<RelationshipModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: RelationshipModel[] = [];
  renderedData: RelationshipModel[] = [];
  constructor (
    public relationshipService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<RelationshipModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.relationshipService.relationshipDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.relationshipService.getRelationshipTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.relationshipService.relationshipData
          .slice()
          .filter((RelationshipModel: RelationshipModel) => {
            const searchStr = RelationshipModel.relationship_name.toLowerCase();
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
  sortData(data: RelationshipModel[]): RelationshipModel[] {
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
        case 'relationship_name':
          [propertyA, propertyB] = [a.relationship_name, b.relationship_name];
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
