import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { TableElement } from 'src/app/shared/TableElement';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { VendorsService } from '../vendors.service';
import { VendorModel } from '../vendor.model';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { commonNewtworkAttachmentViewer, formateAmount, gallery_options, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { VendorReportComponent } from '../vendor-report/vendor-report.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder } from '@angular/forms';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { icon } from 'src/consts/icon';
import { ImportVendorComponent } from '../import-vendor/import-vendor.component';
import { VendorExistListComponent } from '../vendor-exist-list/vendor-exist-list.component';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import * as XLSX from 'xlsx';
import { RolePermission } from 'src/consts/common.model';
import { TermModel } from 'src/app/settings/settings.model';
@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class VendorsListComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  @ViewChild('gallery') gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;
  displayedColumns = ['select', 'vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'actions',];
  vendorService?: VendorsService;
  dataSource!: any;
  selection = new SelectionModel<VendorModel>(true, []);
  id?: number;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage = '';
  rform?: any;
  selectedValue!: string;
  role_permission!: RolePermission;
  exitData!: any[];
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;
  tableRequest = {
    pageIndex: 0,
    pageSize: 10,
    search: '',
    sort: {
      field: 'vendor_created_at',
      order: 'desc'
    }
  };
  pager: any = {
    first: 0,
    last: 0,
    total: 10,
  };
  vendorList!: VendorModel[];

  constructor (
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    private commonService: CommonService,
    public vendorTableService: VendorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    public uiSpinner: UiSpinnerService
  ) {
    super();
  }

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  vendor_status: any = [''];
  is_quickbooks_online = false;
  is_quickbooks_desktop = false;
  isHideAddActionQBD = false;
  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;


  ngOnInit() {
    const vendorDisplay = localStorage.getItem(localstorageconstants.VENDOR_DISPLAY) ?? 'list';
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;

    if (vendorDisplay == 'list') {
      this.loadData();
      this.getCompanyTenants();
    } else {
      this.router.navigate([WEB_ROUTES.VENDOR_GRID]);
    }

    this.rform = this.fb.group({
      vendor_status: [''],
    });

    this.tmp_gallery = gallery_options();
    this.tmp_gallery.actions = [
      {
        icon: 'fas fa-download',
        onClick: this.downloadButtonPress.bind(this),
        titleText: 'download',
      },
    ];
    this.galleryOptions = [this.tmp_gallery];
    this.getTerms();
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      if (data.data.is_quickbooks_desktop) {
        if (this.role_permission.vendor.Add) {
          this.isHideAddActionQBD = true;
        } else {
          this.isHideAddActionQBD = false;
        }

        if (this.role_permission.vendor.Edit) {
          this.isHideEditActionQBD = true;
        } else {
          this.isHideEditActionQBD = false;
        }

        if (this.role_permission.vendor.Delete) {
          this.isHideArchiveActionQBD = true;
        } else {
          this.isHideArchiveActionQBD = false;
        }
      }

      this.is_quickbooks_online = data.data.is_quickbooks_online;
      this.is_quickbooks_desktop = data.data.is_quickbooks_desktop;
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['select', 'vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['select', 'vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'actions'];
      }
    }
    // this.loadData();
  }

  listToGrid() {
    localStorage.setItem(localstorageconstants.VENDOR_DISPLAY, 'grid');
    this.router.navigate([WEB_ROUTES.VENDOR_GRID]);
  }
  // TOOLTIPS
  getTooltip(row: VendorModel) {
    return row.vendor_email;
  }
  getAddTooltip(row: VendorModel) {
    return row.vendor_address;
  }
  getNameTooltip(row: VendorModel) {
    return row.vendor_name;
  }

  refresh() {
    this.loadData();
  }

  onBookChange(ob: any) {
    const selectedBook = ob.value;
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to active all vendor?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allActiveInactive(1);
          }
        });
    } else if (selectedBook == 2) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to Inactive all vendor?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allActiveInactive(2);
          }
        });
    } else if (selectedBook == 3) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to archive all vendor?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
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
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_ALL_DELETE,
      { _id: tmp_ids, is_delete: 1 }
    );
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
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_ALL_VENDOR_STATUS_UPDATE,
      { _id: tmp_ids, vendor_status: status }
    );
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
    this.router.navigate([WEB_ROUTES.VENDOR_FORM]);
  }

  editVendor(vendor: VendorModel) {
    this.router.navigate([WEB_ROUTES.VENDOR_FORM], {
      queryParams: { _id: vendor._id },
    });
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.VENDOR_HISTORY]);
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.vendorList?.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.vendorList?.forEach((row) => this.selection.select(row));
  }
  removeSelectedRows() { }

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
      this.tableRequest.sort.field = 'vendor_created_at';
      this.tableRequest.sort.order = 'desc';
    } else {
      this.tableRequest.sort.field = event.active;
      this.tableRequest.sort.order = event.direction;
    }
    this.loadData();
  }

  public loadData() {
    this.vendorService = new VendorsService(this.httpCall);
    const displayDataChanges = [
      this.vendorService?.dataChange,
      this.vendorService?.vendorPager,
      this.sort.sortChange,
      // this.filterChange,
      this.paginator.page,
    ];
    this.vendorService.getVendorTable({ is_delete: this.isDelete, start: this.tableRequest.pageIndex * 10, length: this.tableRequest.pageSize, search: this.tableRequest.search, sort: this.tableRequest.sort });

    this.dataSource = merge(...displayDataChanges).pipe(
      map(() => {
        this.vendorList = this.vendorService?.data || [];
        this.pager = this.vendorService?.pagerData;
        return this.vendorService?.data.slice();
      })
    );
    this.selection.clear();
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let that = this;
    let workBook: any;
    let jsonData = null;
    let header_;
    const reader = new FileReader();
    const file = ev.target.files[0];
    setTimeout(() => {
      ev.target.value = null;
    }, 200);
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();

        return initial;
      }, {});
      const formData_profle = new FormData();
      formData_profle.append('file', file);
      let apiurl = '';


      apiurl = httpversion.PORTAL_V1 + httproutes.IMPORT_CHECK_VENDOR;


      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.exitData = params;
            const dialogRef = that.dialog.open(VendorExistListComponent, {
              width: '750px',
              height: '500px',
              // data: that.exitData,
              data: { data: that.exitData },
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              this.loadData();
            });
            // that.openErrorDataDialog(params);

          } else {
            showNotification(that.snackBar, params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      // }
    };
    reader.readAsBinaryString(file);
  }



  downloadImport() {

    const dialogRef = this.dialog.open(ImportVendorComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.loadData();
    });

  }

  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x: VendorModel) => ({
        'Vendor Name': x.vendor_name || '',
        'Vendor ID': x.vendor_id || '',
        'Customer ID': x.customer_id || '',
        Phone: x.vendor_phone || '',
        Email: x.vendor_email || '',
        Address: x.vendor_address || '',
        Status: x.vendor_status === 1 ? 'Active' : 'Inactive',
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  // context menu
  onContextMenu(event: MouseEvent, item: VendorModel) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  async updateStatus(vendor: VendorModel) {
    let status = 1;
    if (vendor.vendor_status == 1) {
      status = 2;
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_STATUS_UPDATE,
      { _id: vendor._id, vendor_status: status }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.vendorService?.dataChange.value.findIndex(
        (x) => x._id === vendor._id
      );
      if (foundIndex != null && this.vendorService) {
        this.vendorService.dataChange.value[foundIndex].vendor_status = status;
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async archiveRecover(vendor: VendorModel, is_delete: number) {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_DELETE,
      { _id: vendor._id, is_delete: is_delete }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.vendorService?.dataChange.value.findIndex(
        (x) => x._id === vendor._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.vendorService) {
        this.vendorService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteVendor(vendor: VendorModel, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      this.titleMessage = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.RESTORE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.archiveRecover(vendor, is_delete);
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['select', 'vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['select', 'vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'actions'];
      }
    } else {
      if (this.is_quickbooks_online) {
        this.displayedColumns = ['vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks', 'actions'];
      } else if (this.is_quickbooks_desktop) {
        this.displayedColumns = ['vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'is_quickbooks'];
      } else {
        this.displayedColumns = ['vendor_image', 'vendor_name', 'invoice', 'open_invoice', 'amount_paid', 'amount_open', 'vendor_phone', 'vendor_email', 'vendor_address', 'vendor_status', 'vendor_attachment', 'actions'];
      }
    }
    this.refresh();
  }

  // View Network Attachment
  viewAttachment(vendor: VendorModel) {
    this.galleryImages = commonNewtworkAttachmentViewer(
      vendor.vendor_attachment
    );
    setTimeout(() => {
      this.gallery.openPreview(0);
    }, 0);
  }

  downloadButtonPress(event: any, index: number): void {
    window.location.href = this.imageObject[index];
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET
    );
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

  formateAmount(price: any) {
    return formateAmount(price);
  }
}

// This class is used for datatable sorting and searching
/* export class VendorDataSource extends DataSource<VendorModel> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: VendorModel[] = [];
  renderedData: VendorModel[] = [];
  constructor (
    public vendorService: VendorsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }

  connect(): Observable<VendorModel[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.vendorService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.vendorService.getAllVendorTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.vendorService.data
          .slice()
          .filter((vendor: VendorModel) => {
            const searchStr = (
              vendor.vendor_name +
              vendor.invoices +
              vendor.open_invoices +
              vendor.invoices_total +
              vendor.open_invoices_total +
              vendor.vendor_phone +
              vendor.vendor_email +
              vendor.vendor_address +
              vendor.vendor_status
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
  sortData(data: VendorModel[]): VendorModel[] {
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
        case 'vendor_name':
          [propertyA, propertyB] = [a.vendor_name, b.vendor_name];
          break;
        case 'invoices':
          [propertyA, propertyB] = [a.invoices, b.invoices];
          break;
        case 'open_invoices':
          [propertyA, propertyB] = [a.open_invoices, b.open_invoices];
          break;
        case 'invoices_total':
          [propertyA, propertyB] = [a.invoices_total, b.invoices_total];
          break;
        case 'open_invoices_total':
          [propertyA, propertyB] = [a.open_invoices_total, b.open_invoices_total];
          break;
        case 'vendor_phone':
          [propertyA, propertyB] = [a.vendor_phone, b.vendor_phone];
          break;
        case 'vendor_email':
          [propertyA, propertyB] = [a.vendor_email, b.vendor_email];
          break;
        case 'vendor_address':
          [propertyA, propertyB] = [a.vendor_address, b.vendor_address];
          break;
        case 'vendor_status':
          [propertyA, propertyB] = [a.vendor_status, b.vendor_status];
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
