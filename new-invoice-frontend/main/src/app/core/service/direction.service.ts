import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DirectionService {
  private data = new BehaviorSubject('');
  currentData = this.data.asObservable();

  constructor() {
    //constructor
  }

  updateDirection(item: string) {
    this.data.next(item);
  }
}
