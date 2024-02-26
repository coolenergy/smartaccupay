import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, BehaviorSubject, Observable, merge, map } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { InvoiceService } from '../../invoice.service';
import { InvoiceMessage } from '../../invoice.model';
import { HttpCall } from 'src/app/services/httpcall.service';
import { showNotification, swalWithBootstrapTwoButtons, MMDDYYYY_HH_MM_A, numberWithCommas, formateAmount } from 'src/consts/utils';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { TableElement } from 'src/app/shared/TableElement';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-invoice-messages',
  templateUrl: './invoice-messages.component.html',
  styleUrls: ['./invoice-messages.component.scss']
})
export class InvoiceMessagesComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    'created_at',
    'sender',
    'last_message',
    'invoice_no',
    'due_date',
    'vendor',
    'total_amount',
    'actions',
  ];
  exampleDatabase?: InvoiceService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<InvoiceMessage>(true, []);
  id?: number;
  invoiceTable?: InvoiceMessage;

  type = '';

  constructor (public httpClient: HttpClient, public dialog: MatDialog, public invoiceService: InvoiceService,
    private snackBar: MatSnackBar, public route: ActivatedRoute, private router: Router, private httpCall: HttpCall,
    private commonService: CommonService) {
    super();
    route.queryParams.subscribe(queryParams => {
      this.type = queryParams['type'] ?? '';
      this.type = this.type.replace(/_/g, ' ');
    });
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

  viewMessage(row: InvoiceMessage) {
    this.router.navigate([WEB_ROUTES.INVOICE_MESSAGE_VIEW], { queryParams: { invoice_id: row.invoice_id, from: 'message' } });
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

  public loadData() {
    this.exampleDatabase = new InvoiceService(this.httpCall);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
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
  onContextMenu(event: MouseEvent, item: InvoiceMessage) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  async deleteMessage(message: InvoiceMessage) {
    swalWithBootstrapTwoButtons
      .fire({
        title: 'Are you sure you want to delete this chat?',
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(
            httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE_MESSAGE,
            { _id: message._id }
          );
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.invoiceService?.messageDataChange.value.findIndex(
              (x) => x._id === message._id
            );
            // for delete we use splice in order to remove single object from DataService
            if (foundIndex != null && this.invoiceService) {
              this.invoiceService.messageDataChange.value.splice(foundIndex, 1);
              this.refreshTable();
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x: any) => ({
        'Date & Time': MMDDYYYY_HH_MM_A(x.created_at),
        'Sender': x.last_message_sender.userfullname,
        'Last Message': x.message,
        'Invoice Number': x.invoice.invoice_no,
        'Due Date': MMDDYYYY_HH_MM_A(x.invoice.due_date_epoch),
        'Vendor': x.invoice.vendor.vendor_name,
        'Total Amount': formateAmount(x.invoice.invoice_total_amount),
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  numberWithCommas(amount: number) {
    return numberWithCommas(amount.toFixed(2));
  }
}
export class ExampleDataSource extends DataSource<InvoiceMessage> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: InvoiceMessage[] = [];
  renderedData: InvoiceMessage[] = [];
  constructor (
    public exampleDatabase: InvoiceService,
    public paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<InvoiceMessage[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.messageDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getMessageForTable();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.messageData
          .slice()
          .filter((invoice: InvoiceMessage) => {
            const searchStr = (
              invoice.sender.userfullname +
              invoice.receiver.userfullname
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
  sortData(data: InvoiceMessage[]): InvoiceMessage[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case '_id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'created_at':
          [propertyA, propertyB] = [a.created_at, b.created_at];
          break;
        case 'sender':
          [propertyA, propertyB] = [a.last_message_sender.userfullname, b.last_message_sender.userfullname];
          break;
        case 'last_message':
          [propertyA, propertyB] = [a.last_message.message, b.last_message.message];
          break;
        case 'invoice_no':
          [propertyA, propertyB] = [a.invoice.invoice_no, b.invoice.invoice_no];
          break;
        case 'due_date':
          [propertyA, propertyB] = [a.invoice.due_date_epoch, b.invoice.due_date_epoch];
          break;
        case 'vendor':
          [propertyA, propertyB] = [a.invoice.vendor.vendor_name, b.invoice.vendor.vendor_name];
          break;
        case 'total_amount':
          [propertyA, propertyB] = [a.invoice.invoice_total_amount, b.invoice.invoice_total_amount];
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
