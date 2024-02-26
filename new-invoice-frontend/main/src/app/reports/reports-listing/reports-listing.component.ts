import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { ReportService } from '../report.service';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Report } from '../reports-table.model';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { configData } from 'src/environments/configData';
import { TableElement } from 'src/app/shared/TableElement';
import { formatDate } from '@angular/common';
import { numberWithCommas, timeDateToepoch } from 'src/consts/utils';
import { Invoice } from 'src/app/invoice/invoice.model';

@Component({
  selector: 'app-reports-listing',
  templateUrl: './reports-listing.component.html',
  styleUrls: ['./reports-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class ReportsListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['invoice_date', 'due_date', 'vendor', 'invoice_no', 'total_amount', 'sub_total', 'approver', 'status', 'actions'];
  reportService?: ReportService;
  dataSource!: any;
  selection = new SelectionModel<Report>(true, []);
  id?: number;
  isDelete = 0;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  reportType = '';
  ids: Array<string> = [];
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  dateRange: Array<number> = [0, 0];

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
  invoiceList!: Report[];

  constructor (public ReportServices: ReportService, public httpCall: HttpCall, public uiSpinner: UiSpinnerService,
    public route: ActivatedRoute, private router: Router, public translate: TranslateService,) {
    super();
    route.queryParams.subscribe(queryParams => {
      if (queryParams['report_type']) {
        this.reportType = queryParams['report_type'];
      }
      if (queryParams['vendor_ids']) {
        this.ids = queryParams['vendor_ids'];
      } else if (queryParams['assign_to_ids']) {
        this.ids = queryParams['assign_to_ids'];
      } else if (queryParams['class_name_ids']) {
        this.ids = queryParams['class_name_ids'];
      } else if (queryParams['job_client_name_ids']) {
        this.ids = queryParams['job_client_name_ids'];
      }
    });
  }

  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.loadData();
  }

  getVendorNameTooltip(row: Report) {
    return row.vendor_data?.vendor_name;
  }
  getApproverTooltip(row: Report) {
    return row.assign_to_data?.userfullname;
  }

  editInvoice(row: Report) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: row._id } });
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
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
    this.reportService = new ReportService(this.httpCall);
    const displayDataChanges = [
      this.reportService.reportDataChange,
      this.reportService.reportPager,
      this.sort.sortChange,
      // this.filterChange,
      this.paginator.page,
    ];
    let requestObject = {};
    if (this.reportType == configData.REPORT_TYPE.reportVendor) {
      requestObject = { vendor_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1], start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort };
    } else if (this.reportType == configData.REPORT_TYPE.openApprover) {
      requestObject = { assign_to_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1], start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort };
    } else if (this.reportType == configData.REPORT_TYPE.openClass) {
      requestObject = { class_name_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1], start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort };
    } else if (this.reportType == configData.REPORT_TYPE.openClientJob) {
      requestObject = { job_client_name_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1], start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort };
    } else if (this.reportType == configData.REPORT_TYPE.openVendor) {
      requestObject = { open_invoice: true, vendor_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1], start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort };
    }
    this.reportService.getInvoiceReportTable(requestObject);

    this.dataSource = merge(...displayDataChanges).pipe(
      map(() => {
        this.invoiceList = this.reportService?.reportData || [];
        this.pager = this.reportService?.pagerData;
        return this.reportService?.reportData.slice();
      })
    );
  }

  onContextMenu(event: MouseEvent, item: Report) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x: Report) => ({
        'Invoice Date': x.invoice_date_epoch === 0 ? '' : formatDate(new Date(Number(x.invoice_date_epoch.toString()) * 1000), 'MM/dd/yyyy', 'en'),
        'Due Date': x.due_date_epoch === 0 ? '' : formatDate(new Date(Number(x.due_date_epoch.toString()) * 1000), 'MM/dd/yyyy', 'en'),
        'Vendor': x.vendor_data?.vendor_name,
        'Invoice Number': x.invoice_no,
        'Total Amount': x.invoice_total_amount,
        'Sub Total': x.sub_total,
        'Approver': x.assign_to_data?.userfullname,
        'Status': x.status,
      }));
    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  numberWithCommas(amount: number) {
    return numberWithCommas(amount.toFixed(2));
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_REPORTS]).then();
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    if (dateRangeStart.value != null && dateRangeStart.value != undefined && dateRangeEnd.value != null && dateRangeEnd.value != undefined) {
      this.dateRange = [timeDateToepoch(dateRangeStart.value), timeDateToepoch(dateRangeEnd.value)];
      this.loadData();
    }
  }
}

/* export class ExampleDataSource extends DataSource<Report> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: Report[] = [];
  renderedData: Report[] = [];
  constructor (public exampleDatabase: ReportService, public paginator: MatPaginator, public _sort: MatSort,
    public reportType: string, public ids: Array<string>, public dateRange: Array<number>) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
   
  connect(): Observable<Report[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.reportDataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    let requestObject;
    if (this.reportType == configData.REPORT_TYPE.reportVendor) {
      requestObject = { vendor_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1] };
    } else if (this.reportType == configData.REPORT_TYPE.openApprover) {
      requestObject = { assign_to_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1] };
    } else if (this.reportType == configData.REPORT_TYPE.openClass) {
      requestObject = { class_name_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1] };
    } else if (this.reportType == configData.REPORT_TYPE.openClientJob) {
      requestObject = { job_client_name_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1] };
    } else if (this.reportType == configData.REPORT_TYPE.openVendor) {
      requestObject = { open_invoice: true, vendor_ids: this.ids, start_date: this.dateRange[0], end_date: this.dateRange[1] };
    }

    this.exampleDatabase.getInvoiceReportTable(requestObject);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.reportData
          .slice()
          .filter((invoice: Report) => {
            const searchStr = (
              invoice.invoice_date_epoch +
              invoice.due_date_epoch +
              invoice.vendor_data?.vendor_name +
              invoice.invoice_no +
              invoice.invoice_total_amount +
              invoice.sub_total +
              invoice.assign_to_data?.userfullname +
              invoice.status
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
   
  sortData(data: Report[]): Report[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'invoice_date_epoch':
          [propertyA, propertyB] = [a.invoice_date_epoch, b.invoice_date_epoch];
          break;
        case 'due_date_epoch':
          [propertyA, propertyB] = [a.due_date_epoch, b.due_date_epoch];
          break;
        case 'vendor':
          [propertyA, propertyB] = [a.vendor_data?.vendor_name, b.vendor_data?.vendor_name];
          break;
        case 'invoice_no':
          [propertyA, propertyB] = [a.invoice_no, b.invoice_no];
          break;
        case 'invoice_total_amount':
          [propertyA, propertyB] = [a.invoice_total_amount, b.invoice_total_amount];
          break;
        case 'sub_total':
          [propertyA, propertyB] = [a.sub_total, b.sub_total];
          break;
        case 'approver':
          [propertyA, propertyB] = [a.assign_to_data?.userfullname, b.assign_to_data?.userfullname];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
} */