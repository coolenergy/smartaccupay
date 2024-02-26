import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { ProcessDocument, RolePermission } from 'src/consts/common.model';
import { icon } from 'src/consts/icon';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-duplidate-documents',
  templateUrl: './duplidate-documents.component.html',
  styleUrls: ['./duplidate-documents.component.scss']
})
export class DuplidateDocumentsComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['document_type', 'vendor_name', 'invoice_no', 'status', 'po_no', 'created_by'/* , 'actions' */];
  duplicateDocumentService?: CommonService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<ProcessDocument>(true, []);
  id?: number;
  invoiceTable?: ProcessDocument;
  role_permission!: RolePermission;
  is_quickbooks = false;
  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;

  constructor (public httpClient: HttpClient, public dialog: MatDialog, public translate: TranslateService,
    private snackBar: MatSnackBar, public route: ActivatedRoute, private router: Router, private httpCall: HttpCall,
    private commonService: CommonService,) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
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

  // TOOLTIPS
  getVendorNameTooltip(row: ProcessDocument) {
    return row.vendor_data.vendor_name;
  }

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }

  editDocument(document: ProcessDocument) {
    this.router.navigate([WEB_ROUTES.INVOICE_VIEW_DOCUMENT], { queryParams: { document: document.document_type, _id: document._id, from: 'dashboard' } });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.duplicateDocumentService = new CommonService(this.httpCall);
    this.dataSource = new ExampleDataSource(
      this.duplicateDocumentService,
      this.paginator,
      this.sort,
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

  // context menu
  onContextMenu(event: MouseEvent, item: ProcessDocument) {
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
export class ExampleDataSource extends DataSource<ProcessDocument> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: ProcessDocument[] = [];
  renderedData: ProcessDocument[] = [];
  constructor (
    public exampleDatabase: CommonService,
    public paginator: MatPaginator,
    public _sort: MatSort,
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ProcessDocument[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.duplicateDocumentDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getDuplicateDocumentTable();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.duplicateDocumentData
          .slice()
          .filter((invoice: ProcessDocument) => {
            const searchStr = (
              invoice.document_type +
              invoice.vendor_data.vendor_name +
              invoice.invoice_no +
              invoice.status +
              invoice.po_no +
              invoice.created_by.userfullname
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
  sortData(data: ProcessDocument[]): ProcessDocument[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'document_type':
          [propertyA, propertyB] = [a.document_type, b.document_type];
          break;
        case 'vendor_name':
          [propertyA, propertyB] = [a.vendor_data.vendor_name, b.vendor_data.vendor_name];
          break;
        case 'invoice_no':
          [propertyA, propertyB] = [a.invoice_no, b.invoice_no];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
          break;
        case 'po_no':
          [propertyA, propertyB] = [a.po_no, b.po_no];
          break;
        case 'created_by':
          [propertyA, propertyB] = [a.created_by.userfullname, b.created_by.userfullname];
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
