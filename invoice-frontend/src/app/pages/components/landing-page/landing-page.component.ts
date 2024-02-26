import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { httproutes, localstorageconstants, routes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {

  public routers: typeof routes = routes;
  constructor(public uiSpinner: UiSpinnerService, private router: Router,
    public route: ActivatedRoute, public httpCall: HttpCall) { }

  ngOnInit(): void {

    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    const user_type = localStorage.getItem(localstorageconstants.USERTYPE);
    const userdata = localStorage.getItem(localstorageconstants.USERDATA);
    if (token && userdata) {
      this.router.navigate([this.routers.DASHBOARD]).then();
    } else {
      let email = this.route.snapshot.queryParamMap.get('email');
      let companycode: any = this.route.snapshot.queryParamMap.get('compnaycode');
      let reqObject = {
        useremail: email,
        companycode: companycode
      };
      let that = this;
      that.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCall(httproutes.LOGIN_FROM_OTHER_APP, reqObject).subscribe((data) => {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));
        localStorage.setItem(localstorageconstants.USERTYPE, 'portal');
        localStorage.setItem(localstorageconstants.COMPANYCODE, companycode);
        that.uiSpinner.spin$.next(false);
        if (data.data.UserData.useris_password_temp == false) {
          // if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData); }
          // that.snackbarservice.openSnackBar(that.Login_Form_Login_Successfully, 'success');
          that.router.navigate([that.routers.DASHBOARD]).then();
        }
        else {
          //if (data.data.UserData.role_name != configdata.EMPLOYEE) { that.loginHistory(data.data.UserData) }
          //that.snackbarservice.openSnackBar(that.Login_Form_Login_Success_Reset_Password, 'success');
          that.router.navigateByUrl('/forcefully-changepassword');
        }
        //http://localhost:4200/landing-page?email=ciheminp@gmail.com&compnaycode=R-915126

      });
    }
  }
}
