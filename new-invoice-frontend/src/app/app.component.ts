import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from './services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { swalWithBootstrapButtons } from 'src/consts/utils';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentUrl!: string;
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date;
  title = 'angular-idle-timeout';

  constructor (public translate: TranslateService, public _router: Router, private idle: Idle, private keepalive: Keepalive,
    public commonService: CommonService) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });
    this.updateIdealTimeout();
  }

  async updateIdealTimeout() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS);
    if (data.status) {
      if (data.data.settings.Auto_Log_Off.setting_status == 'Active') {
        // sets an idle timeout of 5 seconds, for testing purposes.
        this.idle.setIdle(Number(data.data.settings.Auto_Log_Off.setting_value) * 60); // 60 x 30 = 30 min
        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
        this.idle.setTimeout(5);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => {
          this.idleState = 'No longer idle.';
          console.log(this.idleState);
          this.reset();
        });

        this.idle.onTimeout.subscribe(() => {
          this.idleState = 'Timed out!';
          this.timedOut = true;
          console.log(this.idleState);
          swalWithBootstrapButtons.close();
          this.reset();// Open User Lock screen
          this._router.navigate(['/authentication/locked']);
        });

        this.idle.onIdleStart.subscribe(() => {
          this.idleState = 'You\'ve gone idle!';
          console.log(this.idleState);

          //display diaglog here
          swalWithBootstrapButtons.fire({
            title: 'Are you sure?',
            text: "You have been inactive for " + Number(data.data.settings.Auto_Log_Off.setting_value) + " minutes, your session is about to end due to inactivity.",
            html: "As a security precaution, if there is no additional activity in your ROVUK session, the session will end and you will be brought to the login page.</br></br>If you are still working please click OK to continue.",
            showCancelButton: true,
            // confirmButtonColor: '#3085d6',
            // cancelButtonColor: '#d33',
            confirmButtonText: 'Logout',
            denyButtonText: "Lock screen",
            showDenyButton: true,
            allowOutsideClick: false,
            background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
            color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
          }).then((result) => {
            this.reset();
            if (result.value) {
              console.log('Logout press');
              this._router.navigate([WEB_ROUTES.LOGIN]);
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              console.log('Ok press');
              this.reset();
              swalWithBootstrapButtons.close();
            }
          });
        });

        this.idle.onTimeoutWarning.subscribe((countdown) => {
          this.idleState = 'You will time out in ' + countdown + ' seconds!';
          console.log(this.idleState);
        });

        // sets the ping interval to 15 seconds
        this.keepalive.interval(15);
        this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
        this.reset();
      }
    }
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }
}
