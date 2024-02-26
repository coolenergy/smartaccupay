import { Injectable } from '@angular/core';
import { Invoice, InvoiceMessage } from './invoice.model';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { Pager } from 'src/consts/common.model';

export interface DataTableRequest {
  is_delete: number;
  start: number;
  length: number;
  search: string;
  type: string;
  sort: {
    field: string,
    order: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class InvoiceService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/invoiceTable.json';
  isTblLoading = true;
  isMessageTblLoading = true;
  dataChange: BehaviorSubject<Invoice[]> = new BehaviorSubject<Invoice[]>([]);
  invoicePager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });
  messageDataChange: BehaviorSubject<InvoiceMessage[]> = new BehaviorSubject<
    InvoiceMessage[]
  >([]);
  // Temporarily stores data from dialogs
  dialogData!: Invoice;
  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): Invoice[] {
    return this.dataChange.value;
  }

  get pagerData(): Pager {
    return this.invoicePager.value;
  }

  get messageData(): InvoiceMessage[] {
    return this.messageDataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  /** CRUD METHODS */
  async getInvoiceTable(requestObject: DataTableRequest): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_FOR_TABLE, requestObject).toPromise();
    this.dataChange.next(data.data);
    this.invoicePager.next(data.pager);
    this.isTblLoading = false;
  }

  // Message Datatable API
  async getMessageForTable(): Promise<void> {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_MESSAGE_FOR_TABLE).toPromise();
    this.isMessageTblLoading = false;
    this.messageDataChange.next(data);
  }
}
