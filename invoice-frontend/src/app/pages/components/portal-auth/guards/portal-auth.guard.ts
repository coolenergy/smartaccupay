import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

import { localstorageconstants, routes } from '../../../../consts';

@Injectable()
export class PortalAuthGuard implements CanActivate {
  public routers: typeof routes = routes;
  role_permission_front: any;
  constructor (private router: Router) {
  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    /* const token = localStorage.getItem('token');
    const user_type = localStorage.getItem(localstorageconstants.USERTYPE);
    if (token) {
      this.role_permission_front   = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)).role_permission
      if (user_type != "portal") {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      } else {
        sessionStorage.setItem(localstorageconstants.USERTYPE, "portal")
        return this.checkRoutePermission(state.url);
      }
    } else {
      if (user_type != "portal") {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      } else {
        sessionStorage.setItem(localstorageconstants.USERTYPE, "portal")
        return true
      }
    } */
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    const sponsor_id = localStorage.getItem(localstorageconstants.SUPPLIERID);
    if (token) {
      sessionStorage.setItem(localstorageconstants.USERTYPE, "invoice-portal");
      return true;
    } else {
      this.router.navigate(['/', sponsor_id]);
    }
  }

  checkRoutePermission(url: any) {
    if (url == "/dashboard") {
      return this.role_permission_front.dashboard.View;
    } else if (url == "/todayactivity") {
      return this.role_permission_front.todayActivity.View;
    } else if (url == "/report") {
      return this.role_permission_front.dailyReports.View;
    } else if (url == "/project-list") {
      return this.role_permission_front.projects.View;
    } else if (url == "/employee-list") {
      return this.role_permission_front.team.team.View;
    } else if (url == "/location") {
      return this.role_permission_front.team.locations.View;
    } else if (url == "/employee-schedule") {
      return this.role_permission_front.team.schedules.View;
    } else if (url == "/employee-timecard") {
      return this.role_permission_front.team.timecard.View;
    } else if (url == "/company-items") {
      return this.role_permission_front.company.item.View;
    } else if (url == "/company-materials") {
      return this.role_permission_front.company.material.View;
    } else if (url == "/company-extramaterial") {
      return this.role_permission_front.company.extra_material.View;
    } else if (url == "/company-equipment") {
      return this.role_permission_front.company.equipment.View;
    } else if (url == "/company-vendor") {
      return this.role_permission_front.company.vendor.View;
    } else if (url == "/company-gasexpenses") {
      return this.role_permission_front.company.gasExpenses.View;
    } else if (url == "/company-purchaseorders") {
      return this.role_permission_front.company.PO.View;
    } else if (url == "/setting") {
      return this.role_permission_front.settings.All;
    } else {
      return true;
    }
  }

}
