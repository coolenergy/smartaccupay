import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WEB_ROUTES } from 'src/consts/routes';
import { VendorModel } from '../vendor.model';
import { HttpClient } from '@angular/common/http';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { VendorsService } from '../vendors.service';
import { formatPhoneNumber, formateAmount, showNotification, timeDateToepoch } from 'src/consts/utils';
import { VendorReportComponent } from '../vendor-report/vendor-report.component';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { FormateDateStringPipe } from 'src/app/users/users-filter.pipe';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import * as XLSX from 'xlsx';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { ImportVendorComponent } from '../import-vendor/import-vendor.component';
import { VendorExistListComponent } from '../vendor-exist-list/vendor-exist-list.component';
import { RolePermission } from 'src/consts/common.model';
import { TermModel } from 'src/app/settings/settings.model';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-vendor-grid',
  templateUrl: './vendor-grid.component.html',
  styleUrls: ['./vendor-grid.component.scss'],
  providers: [FormateDateStringPipe],
})
export class VendorGridComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  vendorList: Array<VendorModel> = [];
  vendorActiveList: Array<VendorModel> = [];
  vendorInactiveList: Array<VendorModel> = [];
  cardLoading = true;
  isDelete = 0;
  active_word = 'Active';
  inactive_word = 'Inactive';
  vendorname_search = '';
  vendor_status = '';
  termsList: Array<TermModel> = [];
  role_permission!: RolePermission;
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  isHideAddActionQBD = false;
  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;
  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;
  is_quickbooks_online = false;
  is_quickbooks_desktop = false;

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public vendorTableService: VendorsService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    public commonService: CommonService,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
  }
  ngOnInit() {
    this.getCompanyTenants();
    this.getVendor();
  }

  gotolist() {
    localStorage.setItem(localstorageconstants.VENDOR_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.VENDOR]);
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

        this.is_quickbooks_online = data.data.is_quickbooks_online;
        this.is_quickbooks_desktop = data.data.is_quickbooks_desktop;

      }
    }
  }

  async getVendor() {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET,
      { is_delete: this.isDelete }
    );
    this.vendorList = data.data;
    this.vendorActiveList = this.vendorList.filter((obj: any) => {
      return obj.vendor_status == 1;
    });
    this.vendorInactiveList = this.vendorList.filter((obj: any) => {
      return obj.vendor_status == 2;
    });
    this.cardLoading = false;
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.cardLoading = true;
    this.vendorList = [];
    this.getVendor();
  }

  refresh() {
    this.getVendor();
  }

  convertDate(date: any) {
    return timeDateToepoch(date);
  }

  addNew() {
    this.router.navigate([WEB_ROUTES.VENDOR_FORM]);
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

  editVendor(vendor: VendorModel) {

    this.router.navigate([WEB_ROUTES.VENDOR_FORM], {
      queryParams: { _id: vendor._id },
    });

  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.VENDOR_HISTORY]);
  }

  formateAmount(price: any) {
    return formateAmount(price);
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
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();
        return initial;
      }, {});
      // const dataString = JSON.stringify(jsonData);
      // const keys_OLD = ["item_type_name", "packaging_name", "terms_name"];
      // if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
      //   that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
      //   return;
      // } else {
      const formData_profle = new FormData();
      formData_profle.append('file', file);
      let apiurl = '';


      apiurl = httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_CHECK_IMPORT_TERMS;


      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            const dialogRef = that.dialog.open(VendorExistListComponent, {
              width: '750px',
              height: '500px',
              data: { data: params },
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              that.refresh();
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
    let that = this;
    const dialogRef = that.dialog.open(ImportVendorComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      that.refresh();
    });
  }

  formatPhoneNumber(phone: any) {
    return formatPhoneNumber(phone);
  }
}
