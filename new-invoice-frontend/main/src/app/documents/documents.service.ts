import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { BehaviorSubject } from 'rxjs';
import { DocumentTable } from './documents.model';
import { DataTableRequest, Pager } from 'src/consts/common.model';

@Injectable()
export class DocumentsService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  dataChange: BehaviorSubject<DocumentTable[]> = new BehaviorSubject<DocumentTable[]>([]);
  documentPager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });

  constructor (private httpCall: HttpCall) {
    super();
  }

  get data(): DocumentTable[] {
    return this.dataChange.value;
  }

  get pagerData(): Pager {
    return this.documentPager.value;
  }

  async getDocumentTable(apiUrl: string, requestObject: DataTableRequest): Promise<void> {
    const data = await this.httpCall.httpPostCall(apiUrl, requestObject).toPromise();
    this.isTblLoading = false;
    this.dataChange.next(data.data);
    this.documentPager.next(data.pager);
  }
}
