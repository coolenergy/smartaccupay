import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, filter, catchError, mergeMap } from 'rxjs/operators';
import { Column } from './column.type';


@Injectable({
    providedIn: 'root'
})
export class GeneralService {

    private serviceUrl = 'https://jsonplaceholder.typicode.com/users';


    constructor(private http: HttpClient) { }

    getUsers(): Observable<Column[]> {
        return this.http.get<Column[]>(this.serviceUrl)
    }

}