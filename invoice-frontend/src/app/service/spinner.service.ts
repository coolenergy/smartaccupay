import { Injectable } from '@angular/core';

//cdk
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

//rxjs
import { Subject } from 'rxjs';
import { scan, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class UiSpinnerService {
  private spinnerTopRef = this.cdkSpinnerCreate();
  spin$: Subject<boolean> = new Subject();

  constructor (private overlay: Overlay) {
    this.spin$
      .asObservable()
      .pipe(
        map(val => val ? 1 : -1),
        scan((acc, one) => (acc + one) >= 0 ? acc + one : 0, 0)
      )
      .subscribe(
        (res) => {
          if (res === 1) { this.showSpinner(); }
          else if (res == 0) {
            this.spinnerTopRef.hasAttached() ? this.stopSpinner() : null;
          }
        }
      );
  }

  private cdkSpinnerCreate() {
    return this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'dark-backdrop',
      positionStrategy: this.overlay.position()
        .global()
        .centerHorizontally()
        .centerVertically()
    });
  }

  private showSpinner() {
    this.spinnerTopRef.attach(new ComponentPortal(AlertComponent));
  }

  private stopSpinner() {
    this.spinnerTopRef.detach();
  }
}

import { Component, Input, EventEmitter, Output, ElementRef } from '@angular/core';
import { trigger, style, animate, transition, state } from '@angular/animations';
import { configdata } from 'src/environments/configData';

@Component({
  selector: "alert",
  template: `
    <img src="{{gif}}" width="100px" height="110px" />
  `,
  animations: [
    trigger('state', [
      state('void, hidden', style({ transform: 'scale(0)' })),
      state('visible', style({ transform: 'scale(1)' })),
      transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ])
  ]
})

export class AlertComponent {
  @Input() type: string = "success";
  @Output() output = new EventEmitter();
  @Output() end = new EventEmitter();
  visibility = 'visible';
  gif = configdata.DEFAULT_LOADER_GIF;

  animationDone(e: any) {
    if (e.toState === 'hidden') {
      this.end.emit(true);
    }
  }

  constructor (private host: ElementRef<HTMLElement>) {
    let temp_gif = localStorage.getItem('gif_loader');
    if (temp_gif != null && temp_gif != undefined && temp_gif != '') {
      this.gif = temp_gif;
    }
  }

  close() {
    this.visibility = 'hidden';
  }
}
