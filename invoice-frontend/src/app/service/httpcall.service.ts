import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UiSpinnerService } from './spinner.service';
import * as moment from 'moment';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from '../consts';

@Injectable({ providedIn: 'root' })
export class HttpCall {
  gif = configdata.DEFAULT_LOADER_GIF;
  temp_gif = localStorage.getItem(localstorageconstants.INVOICE_GIF);

  observer_distributor = new Subject();
  public openmodeledit_distributor$ = this.observer_distributor.asObservable();
  saveEmit = new Subject();
  public saveEmit_$ = this.saveEmit.asObservable();
  LOCAL_OFFSET: any;
  constructor (private http: HttpClient, public uiSpinner: UiSpinnerService) {
    this.LOCAL_OFFSET = moment().utcOffset() * 60;
  }

  getLoader(): string {
    return this.temp_gif != null &&
      this.temp_gif != undefined &&
      this.temp_gif != ""
      ? this.temp_gif
      : this.gif;
  }

  public httpGetCall(userroute: any): Observable<any> {
    let portal_type = sessionStorage.getItem(localstorageconstants.USERTYPE);
    let token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);

    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);

    var url = configdata.apiurl;
    return this.http.get(url + userroute, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public httpPostCall(userroute: any, userdata: any): Observable<any> {
    let portal_type = sessionStorage.getItem(localstorageconstants.USERTYPE);
    let token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);

    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);

    var url = configdata.apiurl;
    return this.http.post(url + userroute, userdata, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public httpPostCallWithoutToken(userroute: any, userdata: any): Observable<any> {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('local_offset', "" + moment().utcOffset() * 60);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + userroute, userdata).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllProject(): Observable<any> {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    const token = localStorage.getItem('token');
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getallprojects", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getJSON(url: any): Observable<any> {
    return this.http.get(url);
  }

  handleError(error: any) {
    if (error.error instanceof Error) {
      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }

  sheduleByDate(body: any): Observable<any> {
    var url = configdata.apiurl;
    return this.http.post(url + 'webapi/v1/portal/onedayschedule', body).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }



}


