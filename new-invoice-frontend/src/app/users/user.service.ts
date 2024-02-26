import { Injectable } from '@angular/core';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { HttpCall } from '../services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { EmergencyContact, UserModel, UserDocument } from './user.model';
import { BehaviorSubject } from 'rxjs';
import { DataTableRequest, Pager } from 'src/consts/common.model';

@Injectable()
export class UserService extends UnsubscribeOnDestroyAdapter {
  isTblLoading = true;
  isEmergencyTblLoading = true;
  documentTblLoading = true;
  dataChange: BehaviorSubject<UserModel[]> = new BehaviorSubject<UserModel[]>([]);
  userPager: BehaviorSubject<Pager> = new BehaviorSubject<Pager>({ first: 0, last: 0, total: 0 });
  emergencyDataChange: BehaviorSubject<EmergencyContact[]> = new BehaviorSubject<EmergencyContact[]>([]);
  documentDataChange: BehaviorSubject<UserDocument[]> = new BehaviorSubject<UserDocument[]>([]);
  // Temporarily stores data from dialogs
  dialogData!: UserModel;

  constructor (private httpCall: HttpCall) {
    super();
  }
  get data(): UserModel[] {
    return this.dataChange.value;
  }

  get pagerData(): Pager {
    return this.userPager.value;
  }

  get emergencyData(): EmergencyContact[] {
    return this.emergencyDataChange.value;
  }

  get documentData(): UserDocument[] {
    return this.documentDataChange.value;
  }

  getDialogData() {
    return this.dialogData;
  }

  // Datatable API
  async getUserForTable(requestObject: DataTableRequest): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE,
        requestObject
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.dataChange.next(data.data);
    this.userPager.next(data.pager);
    this.isTblLoading = false;
  }

  // Emergency Contact Datatable API
  async getEmergencyContactForTable(id: string): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.GET_EMERGENCY_CONTACT,
        { _id: id }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.isEmergencyTblLoading = false;
    this.emergencyDataChange.next(data);
  }

  // User Document Datatable API
  async getUserDocumentForTable(id: string): Promise<void> {
    const data = await this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.GET_USER_DOCUMENT,
        { _id: id }
      )
      .toPromise();
    // Only write this for datatable api otherwise return data
    this.documentTblLoading = false;
    this.documentDataChange.next(data);
  }

  addAdvanceTable(user: UserModel): void {
    this.dialogData = user;
    // this.httpClient.post(this.API_URL, advanceTable)
    //   .subscribe({
    //     next: (data) => {
    //       this.dialogData = advanceTable;
    //     },
    //     error: (error: HttpErrorResponse) => {
    //        // error code here
    //     },
    //   });
  }
}
