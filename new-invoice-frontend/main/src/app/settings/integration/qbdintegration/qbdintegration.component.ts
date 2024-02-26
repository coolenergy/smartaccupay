import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-qbdintegration',
  templateUrl: './qbdintegration.component.html',
  styleUrls: ['./qbdintegration.component.scss']
})
export class QbdintegrationComponent {

  qboIcon: any = icon.QUICKBOOKS_DESKTOP_LOGO;
  qboIntegrated: any;
  showConnectionButton: any;

  constructor (private router: Router) {

  }

  back() {
    this.router.navigate([WEB_ROUTES.INTEGRATION_SETTING]);
  }

  download() {
    // 
  }

  connect() {
    // 
  }
}
