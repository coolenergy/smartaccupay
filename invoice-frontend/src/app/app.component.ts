import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { configdata } from 'src/environments/configData';
import { httproutes, localstorageconstants } from './consts';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Router } from '@angular/router';
import { UiSpinnerService } from './service/spinner.service';
import { Snackbarservice } from './service/snack-bar-service';
import { HttpCall } from './service/httpcall.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import Swal from 'sweetalert2';

import { MatDialog } from '@angular/material/dialog';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Rovuk A/P';
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date;
  deviceInfo: any;
  lookupInfo: any;
  dialogRef: any;
  timeValue: any;
  constructor(public dialog: MatDialog, private deviceService: DeviceDetectorService, public snackbarservice: Snackbarservice, public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public idle: Idle, public keepalive: Keepalive, public translate: TranslateService, private metaService: Meta, private titleService: Title
  ) {
    console.log('====== Constructor call ==========');
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.deviceInfo = this.deviceService.getDeviceInfo();
    localStorage.setItem(localstorageconstants.LANGUAGE, locallanguage);
    this.translate.use(locallanguage);
    this.updateIdealTimeout();
    this.getGIFLoader();
  }

  updateIdealTimeout() {
    console.log('updateIdealTimeout');
    let that = this;
    var logoutStatus = localStorage.getItem(localstorageconstants.LOGOUT);
    console.log(logoutStatus);
    if (logoutStatus == 'false') {
      console.log('======== I AM HERE AFTER LOGIN =============');
      that.httpCall.httpGetCall(httproutes.PORTAL_SETTING_GET).subscribe(function (params) {
        console.log(params);
        that.timeValue = params.data.settings.Auto_Log_Off.setting_value;
        if (params.status) {

          console.log('If 1');
          if (params.data) {
            console.log('If 2');
            if (params.data.settings.Auto_Log_Off.setting_status == "Active") {
              console.log('If 3');

              // sets an idle timeout of 1 min, for testing purposes. 
              //if (that.idle) {
              that.idle.setIdle(that.timeValue * 60); // Change this time from the settings
              //}
              // that.idle.setIdle(60);
              // sets a timeout period of 30 seconds. after 30 seconds of inactivity, the user will be considered timed out.
              that.idle.setTimeout(30);

              // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
              that.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

              that.idle.onIdleEnd.subscribe(() => {
                that.idleState = 'No longer idle.';
                console.log(that.idleState);
                that.reset();
              });

              that.idle.onTimeout.subscribe(() => {
                that.mainLogout();
              });

              that.idle.onIdleStart.subscribe(() => {
                that.idleState = 'You\'ve gone idle!';
                console.log(that.idleState);
                //display diaglog here
                // that.dialogRef = that.dialog.open(TimerDialogComponent, {
                //   height: '280px',
                //   width: '600px',
                //   data: {},
                // });
                // that.dialogRef.afterClosed().subscribe(result => {
                // });
                let val = params.data.settings.Auto_Log_Off.setting_value;
                let message = "You have been inactive for " + val + " minutes, your session is about to end due to inactivity.";
                let htmlData = "As a security precaution, if there is no additional activity in your ROVUK session, the session will end and you will be brought to the login page.</br></br>If you are still working please click OK to continue.";
                swalWithBootstrapButtons.fire({
                  title: message,
                  html: htmlData,
                  showDenyButton: true,
                  showCancelButton: false,
                  confirmButtonText: "Logout",
                  denyButtonText: "OK",
                  allowOutsideClick: false
                }).then((result) => {
                  if (result.isConfirmed) {
                    that.reset();
                    that.mainLogout();
                  } else if (
                    /* Read more about handling dismissals below */
                    result.isDenied
                  ) {
                    that.reset();
                  }
                });
              });

              that.idle.onTimeoutWarning.subscribe((countdown) => {
                that.idleState = 'You will time out in' + countdown + ' seconds!';
                console.log(that.idleState);
              });

              // sets the ping interval to 15 seconds
              that.keepalive.interval(1);

              that.keepalive.onPing.subscribe(() => that.lastPing = new Date());

              that.reset();

            } else {
              that.reset();
            }
            //  else {
            //   console.log("check within inactive");
            //   that.idle.stop();
            // }
          }
        }
      });
    }
  }

  getGIFLoader() {
    let that = this;
    that.httpCall
      .httpPostCallWithoutToken(httproutes.GET_GIF_LOADER, {
        module_name: "Rovuk A/P",
      })
      .subscribe(function (params) {
        if (params.status) {
          if (params.data != null) {
            localStorage.setItem(localstorageconstants.INVOICE_GIF, params.data.gif_url);
          }
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
  }

  mainLogout() {
    let that = this;
    // that.dialogRef.close();
    that.idleState = 'Timed out!';
    that.timedOut = true;
    console.log(that.idleState);
    // Ideal Timeout so Logout.
    that.uiSpinner.spin$.next(true);
    let userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    if (userdata.UserData.role_name != configdata.EMPLOYEE) {
      that.uiSpinner.spin$.next(false);
      that.logoutHistory();
    } else {
      that.uiSpinner.spin$.next(false);
      localStorage.setItem(localstorageconstants.LOGOUT, 'true');
      setTimeout(() => {
        that.router.navigateByUrl('/login');
      }, 100);
    }
  }

  /*  
    Logout History -  This logs user logout action in superadmin panel
  */
  logoutHistory() {
    let that = this;
    fetch("https://ipinfo.io/json?token=a0faf8805063c2")
      .then(res => res.json())
      .then(response => {
        that.lookupInfo = response;
        let loc = that.lookupInfo['loc'];
        let let_log = loc.split(',');
        let reqObject = {
          ip_address: that.lookupInfo['ip'],
          mac_address: "",
          device_type: "Web",
          device_name: that.deviceInfo['device'] + " " + that.deviceInfo['deviceType'],
          os: that.deviceInfo['os'],
          os_version: that.deviceInfo['os_version'],
          browser: that.deviceInfo['browser'],
          browser_version: that.deviceInfo['browser_version'],
          location: that.lookupInfo['city'] + ", " + that.lookupInfo['country'] + " - " + that.lookupInfo['postal'],
          location_lat: let_log[0],
          location_lng: let_log[1]
        };
        that.httpCall.httpPostCall(httproutes.USER_LOGOUT, reqObject).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.uiSpinner.spin$.next(false);
            localStorage.setItem(localstorageconstants.LOGOUT, 'true');
            setTimeout(() => {
              that.router.navigateByUrl('/login');
            }, 100);
          }
          else {
            that.snackbarservice.openSnackBar(params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      })
      .catch((data) => {
      });
  }

  reset() {
    this.idle.watch();
    //this.idleState = 'Started.';
    this.timedOut = false;
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.metaService.addTags([
      { name: 'Rovuk A/P', content: 'Rovuk A/P' },
      { name: 'a construction application', content: 'Rovuk A/P' },
    ]);
  }
}
