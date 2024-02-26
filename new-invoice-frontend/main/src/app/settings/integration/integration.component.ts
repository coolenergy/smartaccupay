import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent {

  qboIcon: any = icon.QUICKBOOKS_ONLINE_LOGO;
  qbdIcon: any = icon.QUICKBOOKS_DESKTOP_LOGO;

  constructor(private router: Router) {

  }

  clickOnCard(type: any) {
    if (type == "qbo") {
      this.router.navigate([WEB_ROUTES.QBO_INTEGRATION_SETTING]);
    } else if (type == "qbd") {
      this.router.navigate([WEB_ROUTES.QBD_INTEGRATION_SETTING]);
    }
  }

  clickOnCalculator() {
    this.router.navigate(["settings/calculator"]);
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
