import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { language_model } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  public loadLanguage(): Observable<language_model[]> {
    return of([
      { name: 'English', value: 'EN' },
      { name: 'Spanish', value: 'ES' }
    ])
  }
}


