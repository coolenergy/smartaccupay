import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class RightSidebarService {
  private sidebarSubject: BehaviorSubject<boolean> = new BehaviorSubject(false);
  sidebarState = this.sidebarSubject.asObservable();

  setRightSidebar = (value: boolean) => {
    this.sidebarSubject.next(value);
  };

  constructor() {
    //constructor
  }
}
