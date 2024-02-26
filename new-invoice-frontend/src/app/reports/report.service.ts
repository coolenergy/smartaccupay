import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { Report } from './reports-table.model';
import { BehaviorSubject } from 'rxjs';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { Pager } from 'src/consts/common.model';

@Injectable()
export class ReportService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;
  isReportTblLoading = true;
  // dataChange: BehaviorSubject<Report[]> = new BehaviorSubject<Report[]>([]);
  reportPager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });
  reportDataChange: BehaviorSubject<Report[]> = new BehaviorSubject<Report[]>([]);
  // Temporarily stores data from dialogs
  // dialogData!: Report;
  constructor (private httpCall: HttpCall) {
    super();
  }
  // get data(): Report[] {
  //   return this.dataChange.value;
  // }

  get reportData(): Report[] {
    return this.reportDataChange.value;
  }

  get pagerData(): Pager {
    return this.reportPager.value;
  }

  // getDialogData() {
  //   return this.dialogData;
  // }

  // async getReportTable() {
  //   const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.INVOICE_FOR_REPORT).toPromise();
  //   return data;
  // }

  async getInvoiceReportTable(requestObject: any): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_FOR_REPORT, requestObject).toPromise();
    this.reportDataChange.next(data.data);
    this.reportPager.next(data.pager);
    this.isReportTblLoading = false;
  }
}
