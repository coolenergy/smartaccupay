import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from 'src/app/consts';

@Injectable({
  providedIn: 'root'
})
export class PortalAuthService {

  constructor (private http: HttpClient) {

  }
  public login(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('language', portal_language);
    localStorage.setItem(localstorageconstants.USERTYPE, "portal");
    sessionStorage.setItem(localstorageconstants.USERTYPE, "portal");
    return this.http.post(url + "/webapi/v1/login", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public forgotPassword(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    localStorage.setItem(localstorageconstants.USERTYPE, "portal");
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('language', portal_language);
    return this.http.post(url + "/webapi/v1/forgetpassword", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public helpSupport(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    localStorage.setItem(localstorageconstants.USERTYPE, "portal");
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('language', portal_language);
    return this.http.post(url + "/webapi/v1/helpmail", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public changePassword(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    headers = headers.set('language', portal_language);
    sessionStorage.setItem(localstorageconstants.USERTYPE, "portal");
    return this.http.post(url + "/webapi/v1/changepassword", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }


  public sign(): void {
    localStorage.setItem('token', 'token');
  }

  public signOut(): void {

    var usertype = sessionStorage.getItem(localstorageconstants.USERTYPE);
    localStorage.removeItem('token');
    localStorage.removeItem(localstorageconstants.USERDATA);
    localStorage.removeItem(localstorageconstants.USERTYPE);
    localStorage.removeItem(localstorageconstants.USERROLE);
    if (usertype == "portal") {

    } else {

    }

  }

  public getUser(): Observable<User> {
    const data: any = localStorage.getItem(localstorageconstants.USERDATA);
    var mapData = JSON.parse(data);
    return of({
      _id: mapData.UserData._id,
      name: mapData.UserData.userfirstname,
      lastName: mapData.UserData.userlastname,
      fullName: mapData.UserData.userfullname
    });
  }

  handleError(error: any) {
    if (!error.error.status) {
    }
    if (error.error instanceof Error) {

      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }
}
