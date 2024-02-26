import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { configdata } from 'src/environments/configData';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { localstorageconstants } from 'src/app/consts';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  observer = new Subject();
  constructor (private http: HttpClient, public snackbar: Snackbarservice) { }
  saveEmaployee(userobject: any): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + "/webapi/v1/portal/saveemployee", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }
  employeeDocumentUpdate(userobject: any): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.post(url + "/webapi/v1/portal/saveuserdocument", userobject, { headers: headers }).pipe(
      map((res) => {

        return res;
      }),
      catchError(this.handleError));
  }
  getalluser(): Observable<any> {
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    var url = configdata.apiurl;
    return this.http.get(url + "/webapi/v1/portal/getalluser", { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }
  handleError(error: any) {
    if (!error.error.status) {
      this.snackbar.openSnackBar(error.error.message, "error");
    }
    if (error.error instanceof Error) {

      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }
}