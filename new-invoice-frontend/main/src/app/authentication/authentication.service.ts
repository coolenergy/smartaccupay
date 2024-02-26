import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpCall } from '../services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<boolean>;
  public currentUser: Observable<boolean>;

  private currentTokenSubject: BehaviorSubject<string>;
  public currentToken: Observable<string>;

  constructor (private httpClient: HttpClient, private httpCall: HttpCall) {
    const logout = localStorage.getItem(localstorageconstants.LOGOUT) ?? 'true';
    this.currentUserSubject = new BehaviorSubject<boolean>(logout == 'true');
    this.currentUser = this.currentUserSubject.asObservable();

    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN) ?? '';
    this.currentTokenSubject = new BehaviorSubject<string>(token);
    this.currentToken = this.currentTokenSubject.asObservable();
  }

  public get currentUserValue(): boolean {
    return this.currentUserSubject.value;
  }

  changeLoginValue(value: boolean) {
    this.currentUserSubject.next(value);
  }

  public get currentTokenValue(): string {
    return this.currentTokenSubject.value;
  }

  changeTokenValue(value: string) {
    this.currentTokenSubject.next(value);
  }
}
