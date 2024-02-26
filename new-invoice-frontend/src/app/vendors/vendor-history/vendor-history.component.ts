import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorsService } from '../vendors.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-vendor-history',
  templateUrl: './vendor-history.component.html',
  styleUrls: ['./vendor-history.component.scss']
})
export class VendorHistoryComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  start = 0;
  vendorHistory: any;
  historyLoading = true;

  constructor(private router: Router, public vendorService: VendorsService, public commonService: CommonService) {
    super();
  }

  ngOnInit() {
    this.getVendorHistory();
  }

  async getVendorHistory() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_HISTORY, { start: this.start });
    if (data.status) {
      if (this.start == 0) {
        this.vendorHistory = data.data;
      } else {
        this.vendorHistory = this.vendorHistory.concat(data.data);
      }
      this.historyLoading = false;
    }
  }

  onScroll() {
    this.start++;
    this.getVendorHistory();
  }

  back() {
    const vendorDisplay = localStorage.getItem(localstorageconstants.VENDOR_DISPLAY) ?? 'list';
    if (vendorDisplay == 'list') {
      this.router.navigate([WEB_ROUTES.VENDOR]);
    } else {
      this.router.navigate([WEB_ROUTES.VENDOR_GRID]);
    }
  }

  setHeightStyles() {
    const styles = {
      height: '770px',
      "overflow-y": "scroll",
    };
    return styles;
  }
}
