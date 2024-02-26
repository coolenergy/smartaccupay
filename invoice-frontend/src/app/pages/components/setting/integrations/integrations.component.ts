import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, } from '@angular/material/snack-bar';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { ModeDetectService } from '../../map/mode-detect.service';

@Component({
  selector: 'app-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent implements OnInit {
  integrationinfo: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  backIcon = icon.BACK;
  subscription: Subscription;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  mode: any;
  constructor (private modeService: ModeDetectService, private _snackBar: MatSnackBar, private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    private route: ActivatedRoute, private router: Router,) {
    this.integrationinfo = this.formBuilder.group({
      quickbooks_client_id: ['', Validators.required],
      quickbooks_client_secret: ['', Validators.required],
    });

    var modeLocal = localStorage.getItem('darkmood');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }


    });
    var requestObject = { data: 'request' };
    this.httpCall.httpPostCall(httproutes.QUICKBOOK_ISCONNECT, requestObject).subscribe(function (params) {
      console.log("this is params");
      console.log(params);
      if (params.isConnect === true) {
        document.getElementById('blogin_id').style.display = "none";
        document.getElementById('blogout_id').style.display = "block";
      } else {
        document.getElementById('blogin_id').style.display = "block";
        document.getElementById('blogout_id').style.display = "none";
      }
    });
  }

  ngOnInit(): void {
    console.log("this is ngOnInit");
    let that = this;
    let userData = JSON.parse(localStorage.getItem("userdata") ?? '');
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_SMTP).subscribe(function (params) {
      if (params.status) {
        that.integrationinfo = that.formBuilder.group({
          quickbooks_client_id: [params.data.quickbooks_client_id, Validators.required],
          quickbooks_client_secret: [params.data.quickbooks_client_secret, Validators.required],
        });
      }
    });



  }

  back(): void {

  }

  clickOnCard(type: any) {
    this.router.navigate(['/setting/view-integration'],);
  }
  openSnackBar(): void {
    this._snackBar.open("You have integrated with QB", "Close", {
      duration: 3000
    });
  }
  logout(): void {
    var reqObject = {
      companycode: localStorage.getItem('companycode')
    };
    document.getElementById('blogin_id').style.display = "block";
    document.getElementById('blogout_id').style.display = "none";
    localStorage.removeItem("isCheckSync_QBO");
    this.httpCall.httpPostCall(httproutes.QUICKBOOK_LOGOUT, reqObject).subscribe(function (resdata) {

    });
  }
  saveData(): void {
    let that = this;
    // if (this.integrationinfo.valid)
    // {
    var reqObject = this.integrationinfo.value;
    localStorage.setItem('integratewithQBO', 'no');
    reqObject.quickbooks_client_id = "client_id";
    reqObject.quickbooks_client_secret = "client_secret";
    reqObject.companycode = localStorage.getItem('companycode');
    this.httpCall.httpPostCall(httproutes.QUICKBOOK_SAVE_INFO, reqObject).subscribe(function (resdata) {
      const authUri = resdata.authUri;
      var parameters = "location=1,width=800,height=650";
      parameters += ",left=" + (screen.width - 800) / 2 + ",top=" + (screen.height - 650) / 2;
      var win = window.open(authUri, 'connectPopup', parameters);
      var pollOAuth = window.setInterval(function () {
        try {

          if (win.closed === true) {
            console.log(localStorage.getItem('integratewithQBO'));
            clearInterval(pollOAuth);
          }

        } catch (e) {
          console.log(e);
        }
      }, 100);
      window.addEventListener('message', (event) => {
        if (event.data?.msg && win.closed === false) {
          console.log(event.data);
          console.log(win.closed);
          that._snackBar.open("You have integrated with QB", "Close", {
            horizontalPosition: that.horizontalPosition,
            verticalPosition: that.verticalPosition,
            duration: 4000,
          });
          document.getElementById('blogin_id').style.display = "none";
          document.getElementById('blogout_id').style.display = "block";
          localStorage.setItem("isCheckSync_QBO", JSON.stringify(event.data));
          const { bill, vendor, gl } = event.data;
          if (bill) {
            that.httpCall.httpPostCall(httproutes.SAVE_INVOICE_DATABASE, reqObject).subscribe(function (resdata) {
              console.log("I have saved bill datas");
            });
          }
          if (vendor) {
            that.httpCall.httpPostCall(httproutes.SAVE_VENDORS_DATABASE, reqObject).subscribe(function (resdata) {
              console.log("I have saved vendor datas");
            });
          }
          if (gl) {
            that.httpCall.httpPostCall(httproutes.SAVE_GLACCOUNTS_DATABASE, reqObject).subscribe(function (resdata) {
              console.log("I have saved GL account datas");
            });
          }
        }
        if (event.data?.data) {
          console.log(event.data.data);
        }
      });
    });

  }

}