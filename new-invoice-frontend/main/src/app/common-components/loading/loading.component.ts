import { Component, OnInit } from '@angular/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  loadingImg = '';

  constructor (public httpCall: HttpCall) {
    super();
  }

  ngOnInit(): void {
    this.loadingImg = this.httpCall.getLoader();
  }
}
