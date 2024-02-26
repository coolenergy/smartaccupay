import { Injectable } from '@angular/core';
import { HttpCall } from './httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { ProcessDocument } from 'src/consts/common.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService extends UnsubscribeOnDestroyAdapter {


  constructor (private httpCall: HttpCall) {
    super();
  }

  async saveAttachment(requestObject: any) {
    const data = await this.httpCall.httpPostCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, requestObject).toPromise();
    return data;
  }

  async getRequestAPI(apiUrl: string) {
    const data = await this.httpCall.httpGetCall(apiUrl).toPromise();
    return data;
  }

  async postRequestAPI(apiUrl: string, requestObject: any) {
    const data = await this.httpCall.httpPostCall(apiUrl, requestObject).toPromise();
    return data;
  }

  isDuplicateDocumentTblLoading = true;
  duplicateDocumentDataChange: BehaviorSubject<ProcessDocument[]> = new BehaviorSubject<ProcessDocument[]>([]);
  get duplicateDocumentData(): ProcessDocument[] {
    return this.duplicateDocumentDataChange.value;
  }
  async getDuplicateDocumentTable(): Promise<void> {
    const data = await this.httpCall.httpGetCall(httpversion.PORTAL_V1 + httproutes.GET_DUPLICATE_DOCUMENT_FOR_TABLE).toPromise();
    this.isDuplicateDocumentTblLoading = false;
    this.duplicateDocumentDataChange.next(data);
  }
}
