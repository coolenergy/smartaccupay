import { Injectable } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { BehaviorSubject } from 'rxjs';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { ClientJobModel } from './client.model';
import { DataTableRequest, Pager } from 'src/consts/common.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService extends UnsubscribeOnDestroyAdapter {
  private readonly API_URL = 'assets/data/advanceTable.json';
  isTblLoading = true;

  dataChange: BehaviorSubject<ClientJobModel[]> = new BehaviorSubject<ClientJobModel[]>([]);
  clientJobPager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });
  // Temporarily stores data from dialogs 
  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): ClientJobModel[] {
    return this.dataChange.value;
  }

  get pagerData(): Pager {
    return this.clientJobPager.value;
  }

  async getClientTable(requestObject: DataTableRequest): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.CLIENT_DATA_TABLE, requestObject).toPromise();
    this.isTblLoading = false;
    this.dataChange.next(data.data);
    this.clientJobPager.next(data.pager);
  }
}
