import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { Invoice } from '../invoice.model';
import { InvoiceService } from '../invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WEB_ROUTES } from 'src/consts/routes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { numberWithCommas, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UploadInvoiceFormComponent } from '../upload-invoice-form/upload-invoice-form.component';
import { TranslateService } from '@ngx-translate/core';
import { TableElement } from 'src/app/shared/TableElement';
import { formatDate } from '@angular/common';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-invoice-listing',
  templateUrl: './invoice-listing.component.html',
  styleUrls: ['./invoice-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class InvoiceListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['invoice_date', 'due_date', 'vendor', 'invoice_no', 'total_amount', 'sub_total', 'approver', 'status', 'is_quickbooks', 'actions'];
  invoiceService?: InvoiceService;
  dataSource!: any;
  id?: number;
  invoiceTable?: Invoice;
  isDelete = 0;
  type = '';
  role_permission!: RolePermission;
  is_quickbooks = false;
  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;
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
  invoiceList!: Invoice[];

  constructor (public httpClient: HttpClient, public dialog: MatDialog, public settingService: InvoiceService,
    private snackBar: MatSnackBar, public route: ActivatedRoute, private router: Router, private httpCall: HttpCall,
    private commonService: CommonService, public translate: TranslateService) {
    super();
    route.queryParams.subscribe(queryParams => {
      this.type = queryParams['type'] ?? '';
      this.type = this.type.replace(/_/g, ' ');
    });
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  ngOnInit() {
    this.getCompanyTenants();
    this.loadData();
  }
  refresh() {
    this.loadData();
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      this.is_quickbooks = data.data.is_quickbooks_online || data.data.is_quickbooks_desktop;
      if (this.is_quickbooks) {
        this.displayedColumns = ['invoice_date', 'due_date', 'vendor', 'invoice_no', 'total_amount', 'sub_total', 'approver', 'status', 'is_quickbooks', 'actions'];
      } else {
        this.displayedColumns = ['invoice_date', 'due_date', 'vendor', 'invoice_no', 'total_amount', 'sub_total', 'approver', 'status', 'actions'];
      }
    }
    // this.loadData();
  }

  // TOOLTIPS
  getVendorNameTooltip(row: Invoice) {
    return row.vendor_data?.vendor_name;
  }
  getApproverTooltip(row: Invoice) {
    return row.assign_to_data?.userfullname;
  }

  editInvoice(row: Invoice) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: row._id } });
  }

  deleteInvoice(invoice: Invoice, is_delete: number) {
    let titleMessage;
    if (is_delete == 1) {
      titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.RESTORE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE, { _id: invoice._id, is_delete: is_delete });
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.invoiceService?.dataChange.value.findIndex((x) => x._id === invoice._id);
            if (foundIndex != null && this.invoiceService) {
              this.invoiceService.dataChange.value.splice(foundIndex, 1);
              this.refreshTable();
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.refresh();
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
    this.invoiceService = new InvoiceService(this.httpCall);
    const displayDataChanges = [
      this.invoiceService.dataChange,
      this.invoiceService.invoicePager,
      this.sort.sortChange,
      // this.filterChange,
      this.paginator.page,
    ];
    this.invoiceService.getInvoiceTable({ is_delete: this.isDelete, start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, type: this.type, sort: this.tableRequest.sort });

    this.dataSource = merge(...displayDataChanges).pipe(
      map(() => {
        this.invoiceList = this.invoiceService?.data || [];
        this.pager = this.invoiceService?.pagerData;
        return this.invoiceService?.data.slice();
      })
    );
  }

  // context menu
  onContextMenu(event: MouseEvent, item: Invoice) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  uploadInvoice() {
    const dialogRef = this.dialog.open(UploadInvoiceFormComponent, {
      width: '80%',
      data: {
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      //  
    });
  }

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x: Invoice) => ({
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
} 
