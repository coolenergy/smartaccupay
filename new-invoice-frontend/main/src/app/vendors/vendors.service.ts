import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { VendorModel } from './vendor.model';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { DataTableRequest, Pager } from 'src/consts/common.model';
@Injectable()

export class VendorsService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  dataChange: BehaviorSubject<VendorModel[]> = new BehaviorSubject<VendorModel[]>([]);
  vendorPager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });
  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): VendorModel[] {
    return this.dataChange.value;
  }

  get pagerData(): Pager {
    return this.vendorPager.value;
  }

  // Datatable API
  async getVendorTable(requestObject: DataTableRequest): Promise<void> {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET_FOR_TABLE, requestObject).toPromise();
    this.dataChange.next(data.data);
    this.vendorPager.next(data.pager);
    this.isTblLoading = false;
  }
}
