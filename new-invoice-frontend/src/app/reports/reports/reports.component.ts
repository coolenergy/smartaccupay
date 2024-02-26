import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { SelectReportValueComponent } from '../select-report-value/select-report-value.component';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { VendorModel } from 'src/app/vendors/vendor.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { configData } from 'src/environments/configData';
import { WEB_ROUTES } from 'src/consts/routes';
import { UserModel } from 'src/app/users/user.model';
import { ClassNameModel } from 'src/app/settings/settings.model';
import { ClientJobModel } from 'src/app/client/client.model';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent extends UnsubscribeOnDestroyAdapter {
  reportList: any = [
    {
      title: 'Report By Vendor',
      description: 'Description For Report By Vendor',
      click: this.reportByVendor,
    },
    {
      title: 'Open Item By Approver',
      description: 'Description For Open Item By Approver',
      click: this.itemByApprover,
    },
    {
      title: 'Open Item By Class',
      description: 'Description For Open Item By Class',
      click: this.itemByClass,
    },
    {
      title: 'Open Item By Client/Job Name',
      description: 'Description For Open Item By Client/Job Name',
      click: this.itemByClientJob,
    },
    {
      title: 'Open Item By Vendor',
      description: 'Description For Open Item By Vendor',
      click: this.itemByVendor,
    },
  ];
  vendorList: Array<VendorModel> = [];
  userList: Array<UserModel> = [];
  classNameList: Array<ClassNameModel> = [];
  clientList: Array<ClientJobModel> = [];
  reportType = configData.REPORT_TYPE;
  dark = false;

  constructor (public dialog: MatDialog, private commonService: CommonService, public route: ActivatedRoute,
    public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, public translate: TranslateService, private router: Router,) {
    super();
  }

  async reportByVendor() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET, { is_delete: 0 });
    if (data.status) {
      this.vendorList = data.data;
    }
    this.uiSpinner.spin$.next(false);
    const dialogRef = this.dialog.open(SelectReportValueComponent, {
      width: '28%',
      data: {
        title: this.reportType.reportVendor,
        vendorList: this.vendorList,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.router.navigate([WEB_ROUTES.VIEW_REPORT], { queryParams: { report_type: this.reportType.reportVendor, vendor_ids: result.data.vendor_ids } });
        }
      }
    });
  }

  async itemByApprover() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_GET_ALL_USERS);
    if (data.status) {
      this.userList = data.data;
    }
    this.uiSpinner.spin$.next(false);
    const dialogRef = this.dialog.open(SelectReportValueComponent, {
      width: '28%',
      data: {
        title: this.reportType.openApprover,
        userList: this.userList,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.router.navigate([WEB_ROUTES.VIEW_REPORT], { queryParams: { report_type: this.reportType.openApprover, assign_to_ids: result.data.assign_to_ids } });
        }
      }
    });
  }

  async itemByClass() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLASS_NAME);
    if (data.status) {
      this.classNameList = data.data;
    }
    this.uiSpinner.spin$.next(false);
    const dialogRef = this.dialog.open(SelectReportValueComponent, {
      width: '28%',
      data: {
        title: this.reportType.openClass,
        classNameList: this.classNameList,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.router.navigate([WEB_ROUTES.VIEW_REPORT], { queryParams: { report_type: this.reportType.openClass, class_name_ids: result.data.class_name_ids } });
        }
      }
    });
  }

  async itemByClientJob() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLIENT);
    if (data.status) {
      this.clientList = data.data;
    }
    this.uiSpinner.spin$.next(false);
    const dialogRef = this.dialog.open(SelectReportValueComponent, {
      width: '28%',
      data: {
        title: this.reportType.openClientJob,
        clientList: this.clientList,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.router.navigate([WEB_ROUTES.VIEW_REPORT], { queryParams: { report_type: this.reportType.openClientJob, job_client_name_ids: result.data.job_client_name_ids } });
        }
      }
    });
  }

  async itemByVendor() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET, { is_delete: 0 });
    if (data.status) {
      this.vendorList = data.data;
    }
    this.uiSpinner.spin$.next(false);
    const dialogRef = this.dialog.open(SelectReportValueComponent, {
      width: '28%',
      data: {
        title: this.reportType.openVendor,
        vendorList: this.vendorList,
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result.status) {
          this.router.navigate([WEB_ROUTES.VIEW_REPORT], { queryParams: { report_type: this.reportType.openVendor, vendor_ids: result.data.vendor_ids } });
        }
      }
    });
  }
}
