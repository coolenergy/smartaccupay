import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-invoice-history',
  templateUrl: './invoice-history.component.html',
  styleUrls: ['./invoice-history.component.scss']
})
export class InvoiceHistoryComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  start = 0;
  invoiceHistory: any;
  historyLoading = true;
  id: any;

  constructor (private router: Router, public commonService: CommonService,
    public route: ActivatedRoute) {
    super();
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
  }

  ngOnInit() {
    this.getVendorHistory();
  }

  async getVendorHistory() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_HISTORY, { _id: this.id, start: this.start });
    if (data.status) {
      if (this.start == 0) {
        this.invoiceHistory = data.data;
      } else {
        this.invoiceHistory = this.invoiceHistory.concat(data.data);
      }
      this.historyLoading = false;
    }
  }

  onScroll() {
    this.start++;
    this.getVendorHistory();
  }

  back() {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: this.id } });
  }

  setHeightStyles() {
    const styles = {
      height: '770px',
      "overflow-y": "scroll",
    };
    return styles;
  }
}
