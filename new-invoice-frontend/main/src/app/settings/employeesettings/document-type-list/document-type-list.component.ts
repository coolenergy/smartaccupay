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
import {
  showNotification,
  swalWithBootstrapButtons,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { DocumentTypeModel } from '../../settings.model';
import { SettingsService } from '../../settings.service';
import { DocumentTypeFormComponent } from './document-type-form/document-type-form.component';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-document-type-list',
  templateUrl: './document-type-list.component.html',
  styleUrls: ['./document-type-list.component.scss'],
})
export class DocumentTypeListComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['document_type_name', 'is_expiration', 'actions'];
  documentService?: SettingsService;
  dataSource!: DocumentTypeDataSource;
  selection = new SelectionModel<DocumentTypeModel>(true, []);
  id?: number;
  // advanceTable?: DocumentTypeModel;
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

  edit(document: any) {
    let that = this;
    const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
      width: '350px',
      data: document,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.status) {
          const foundIndex = this.documentService?.documentTypeDataChange.value.findIndex((x) => x._id === document._id);
          if (foundIndex != null && this.documentService) {
            this.documentService.documentTypeDataChange.value[foundIndex].document_type_name = result.data.name;
            this.documentService.documentTypeDataChange.value[foundIndex].is_expiration = result.data.is_expiration;
            this.refreshTable();
          }
        }
      }
    });
  }

  async deleteDocumentType(document: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DOCUMENT'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTING_DOCUMENT_TYPE_DELETE, { _id: document._id });
          if (data.status) {
            showNotification(that.snackBar, data.message, 'success');
            const foundIndex = this.documentService?.documentTypeDataChange.value.findIndex(
              (x) => x._id === document._id
            );
            if (foundIndex != null && this.documentService) {
              this.documentService.documentTypeDataChange.value.splice(foundIndex, 1);
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

  public loadData() {
    this.documentService = new SettingsService(this.httpCall);
    this.dataSource = new DocumentTypeDataSource(
      this.documentService,
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
    this.selection.clear();
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }

  // context menu
  onContextMenu(event: MouseEvent, item: DocumentTypeModel) {
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
export class DocumentTypeDataSource extends DataSource<DocumentTypeModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: DocumentTypeModel[] = [];
  renderedData: DocumentTypeModel[] = [];
  constructor (
    public documentService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentTypeModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.documentService.documentTypeDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.documentService.getDocumentTypeTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.documentService.documentTypeData
          .slice()
          .filter((documentTable: DocumentTypeModel) => {
            const searchStr = (
              documentTable.document_type_name +
              documentTable.is_expiration
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
  sortData(data: DocumentTypeModel[]): DocumentTypeModel[] {
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
        case 'document_type_name':
          [propertyA, propertyB] = [a.document_type_name, b.document_type_name];
          break;
        case 'is_expiration':
          [propertyA, propertyB] = [a.is_expiration, b.is_expiration];
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
