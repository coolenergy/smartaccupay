import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models';
import { map, catchError } from 'rxjs/operators';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from 'src/app/consts';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private http: HttpClient) { }
  public login(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('language', portal_language);
    sessionStorage.setItem(localstorageconstants.USERTYPE, "superadmin");
    return this.http.post(url + "/webapi/v1/superadmin/login", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public helpSupport(userobject: any): Observable<any> {
    var url = configdata.apiurl;
    sessionStorage.setItem(localstorageconstants.USERTYPE, "portal");
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers: any = new HttpHeaders();
    headers = headers.set('language', portal_language);
    return this.http.post(url + "/mobile/v1/helpmail", userobject, { headers: headers }).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public sign(): void {
    localStorage.setItem('token', 'token');
  }

  public signOut(): void {
    localStorage.removeItem('token_superadmin');
    localStorage.removeItem('usertype_superadmin');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem(localstorageconstants.USERTYPE);
  }

  public signPortalOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem(localstorageconstants.USERDATA);
    localStorage.removeItem(localstorageconstants.USERTYPE);
    localStorage.removeItem(localstorageconstants.USERROLE);
    localStorage.removeItem('username');
  }

  public getUser(): Observable<User> {
    const isPortal = localStorage.getItem("usertype_superadmin");
    if (isPortal == 'portal') {
      const data: any = localStorage.getItem(localstorageconstants.USERDATA);
      var mapData = JSON.parse(data);
      return of({
        _id: mapData.UserData._id,
        name: mapData.UserData.userfirstname + " " + mapData.UserData.userlastname,
        lastName: "",
        fullName: mapData.UserData.userfullname
      });
    } else {
      const data: any = localStorage.getItem('username');
      return of({
        _id: "",
        name: data,
        lastName: "",
        fullName: ""
      });
    }
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
