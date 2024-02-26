import { Injectable } from '@angular/core';
import { from, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { switchMap } from 'rxjs/operators';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from '../consts';

@Injectable({ providedIn: 'root' })
export class Mostusedservice {

  constructor (private http: HttpClient) { }

  deleteUserEmit = new Subject();
  public deleteUserEmit$ = this.deleteUserEmit.asObservable();
  userdeleteEmit() {
    this.deleteUserEmit.next(true);
  }

  updatecompnayUserEmit = new Subject();
  public updatecompnayUserEmit$ = this.updatecompnayUserEmit.asObservable();

  userupdatecompnayEmit() {
    this.updatecompnayUserEmit.next(true);
  }

  refreshReportDaily = new Subject();
  public refreshReportDaily$ = this.refreshReportDaily.asObservable();
  updaterefreshReportDaily() {
    this.refreshReportDaily.next(true);
  }

  public getAllRoles(): Observable<any> {
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getallroles", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllpayroll_group(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getAllpayroll_group", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAlljobtype(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getAlljobtype", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAlljobtitle(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getAlljobtitle", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllDocumentType(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getalldoctype", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllDepartment(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getalldepartment", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getAllLocation(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getalllocation", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getSpecificUsers(userdata: any): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + "/webapi/v1/portal/getspecificusers", userdata, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }
  public getOneUser(userdata: any): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + "/webapi/v1/portal/getoneuser", userdata, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public imageToBase(url: any): any {
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        switchMap(blob => { return this.convertBlobToBase64_new(blob); }));
  }
  public async imageToBase_async_(url: any) {
    return await this.http.get(url, { responseType: 'blob' })
      .pipe(
        switchMap(blob => { return this.convertBlobToBase64_new(blob); })).toPromise();
  }

  public async imageToBase_async(url: any) {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var apiurl = configdata.apiurl;
    return await this.http.post(apiurl + "/webapi/v1/portal/urlToBase64api", { url: url }, { headers: headers })
      .pipe(
        map(res => { return res; })).toPromise();
  }

  public convertBlobToBase64_new(blob: any) {
    return Observable.create((observer: any) => {
      const reader = new FileReader();
      const binaryString = reader.readAsDataURL(blob);
      reader.onload = (event: any) => {

        observer.next(event.target.result);
        observer.complete();
      };

      reader.onerror = (event: any) => {

        observer.next(event.target.error.code);
        observer.complete();
      };
    });
  }

  handleError(error: any) {
    if (error.error instanceof Error) {

      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }
}