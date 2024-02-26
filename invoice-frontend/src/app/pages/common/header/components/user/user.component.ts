/*
 *
 * Rovuk A/P
 *
 * This class is the maintain menu action for login user
 * The actions like Change Password, Theme Change, Signout
 * Also User can access Help and Terms & Condition page
 * 
 */

import { Component, EventEmitter, Output, OnInit, HostBinding } from '@angular/core';
import { FormControl } from '@angular/forms';
import { httproutes, icon, localstorageconstants, routes } from "../../../../../consts";
import { LayoutService } from '../../../../../shared/services/layout.service';

import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ThemeService } from 'ng2-charts';
import { Router } from '@angular/router';
import { configdata } from 'src/environments/configData';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/pages/superadmin/auth/services';

type Theme = 'light-theme' | 'dark-theme';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})

export class UserComponent implements OnInit {
  user: any;
  @HostBinding('class') className = '';
  @Output() signOut: EventEmitter<void> = new EventEmitter<void>();
  public routes: typeof routes = routes;
  public isChecked: any;
  toggleControl = new FormControl(false);
  public usertype: any;
  public signOutEmit(): void {
    this.signOut.emit();
  }
  deviceInfo: any;
  lookupInfo: any;
  public selectedTheme: any;
  mode: any;
  subscription: Subscription;
  changePasswordIcon: any;
  helpIcon: any;
  termsIcon: any;
  logoutIcon: any;
  themeModeIcon: any;
  usericon: string;
  headerUserIcon = icon.USERLIGHT_ICON;
  Do_Want_logout = "";
  logut_button = "";
  stay_button = "";

  /*
    Constructor
  */
  constructor(private modeService: ModeDetectService, private layoutService: LayoutService, public translate: TranslateService, private themeService: ThemeService,
    public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService, private authservice: AuthService,
    private router: Router, private deviceService: DeviceDetectorService, public httpCall: HttpCall) {

    let that = this;
    // this.uiSpinner.spin$.next(true);
    that.translate.stream(['']).subscribe((textarray) => {
      that.Do_Want_logout = that.translate.instant('Do_Want_logout');
      that.logut_button = that.translate.instant('logut_button');
      that.stay_button = that.translate.instant('stay_button');

    });
    var tmp_local_mode = localStorage.getItem(localstorageconstants.DARKMODE);
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.usericon = icon.USER_ICON;
      this.changePasswordIcon = "./assets/diversityicon/thememode/changepassword_icon.png";
      this.helpIcon = "./assets/diversityicon/thememode/help_icon.png";
      this.termsIcon = "./assets/diversityicon/thememode/terms_icon.png";
      this.logoutIcon = "./assets/diversityicon/thememode/logout_icon.png";
      this.themeModeIcon = "./assets/diversityicon/moon_icon.png";
    } else {
      this.usericon = icon.USERLIGHT_ICON;
      this.changePasswordIcon = "./assets/diversityicon/darkmode/changepassword_icon_dark.png";
      this.helpIcon = "./assets/diversityicon/darkmode/help_icon_dark.png";
      this.termsIcon = "./assets/diversityicon/darkmode/terms_icon_dark.png";
      this.logoutIcon = "./assets/diversityicon/darkmode/logout_icon_dark.png";
      this.themeModeIcon = "./assets/diversityicon/sun_icon.png";
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.usericon = icon.USER_ICON;
        this.changePasswordIcon = "./assets/diversityicon/thememode/changepassword_icon.png";
        this.helpIcon = "./assets/diversityicon/thememode/help_icon.png";
        this.termsIcon = "./assets/diversityicon/thememode/terms_icon.png";
        this.logoutIcon = "./assets/diversityicon/thememode/logout_icon.png";
        this.themeModeIcon = "./assets/diversityicon/moon_icon.png";
      } else {
        this.mode = 'on';
        this.usericon = icon.USERLIGHT_ICON;
        this.changePasswordIcon = "./assets/diversityicon/darkmode/changepassword_icon_dark.png";
        this.helpIcon = "./assets/diversityicon/darkmode/help_icon_dark.png";
        this.termsIcon = "./assets/diversityicon/darkmode/terms_icon_dark.png";
        this.logoutIcon = "./assets/diversityicon/darkmode/logout_icon_dark.png";
        this.themeModeIcon = "./assets/diversityicon/sun_icon.png";
      }
    });

    var locallanguage = tmp_local_mode == "" || tmp_local_mode == undefined || tmp_local_mode == null ? configdata.tmp_localmode : tmp_local_mode;
    var body = document.getElementsByTagName('body')[0];
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "portal";
    if (locallanguage === "on") {
      this.isChecked = true;
      body.classList.add("darkMode");
      this.layoutService.getLeftHeaderThemeOnChange("theme2");
      this.layoutService.getHeaderThemeOnChange("theme2");
      this.layoutService.getAsidebarThemeOnChange("theme2");
    } else {
      this.isChecked = false;
      localStorage.setItem(localstorageconstants.DARKMODE, "off");
      body.classList.remove('darkMode');
      this.layoutService.getLeftHeaderThemeOnChange("theme1");
      this.layoutService.getHeaderThemeOnChange("theme1");
      this.layoutService.getAsidebarThemeOnChange("theme1");
    }

    this.epicFunction();
  }

  /*
    ngOnInit
  */
  ngOnInit(): void {
    let that = this;
    const isPortal = sessionStorage.getItem(localstorageconstants.USERTYPE);
    if (isPortal == 'invoice-portal') {
      const data: any = localStorage.getItem(localstorageconstants.USERDATA);
      var mapData = JSON.parse(data);
      that.user = ({
        _id: mapData.UserData._id,
        name: mapData.UserData.username + " " + mapData.UserData.userlastname,
        lastName: "",
        fullName: mapData.UserData.userfullname
      });
    } else {
      const data = localStorage.getItem('username');
      that.user = ({
        _id: "",
        name: data,
        lastName: "",
        fullName: ""
      });
    }

    this.toggleControl.valueChanges.subscribe((darkMode) => {
      const darkClassName = 'darkMode';
      var tmp_className = darkMode ? darkClassName : '';
      var body = document.getElementsByTagName('body')[0];
      if (tmp_className === "darkMode") {
        localStorage.setItem(localstorageconstants.DARKMODE, "on");
        body.classList.add("darkMode");
        that.layoutService.getLeftHeaderThemeOnChange("theme2");
        that.layoutService.getHeaderThemeOnChange("theme2");
        that.layoutService.getAsidebarThemeOnChange("theme2");
        this.modeService.clearModeDetects();

      } else {
        localStorage.setItem(localstorageconstants.DARKMODE, "off");
        body.classList.remove('darkMode');
        that.layoutService.getLeftHeaderThemeOnChange("theme1");
        that.layoutService.getHeaderThemeOnChange("theme1");
        that.layoutService.getAsidebarThemeOnChange("theme1");
        this.modeService.sendModeDetect('off');

      }

      if (darkMode == false) {
        this.selectedTheme = "light-theme";
      }
      else if (darkMode == true) {
        this.selectedTheme = "dark-theme";
      }

      let overrides;
      if (this.selectedTheme === 'dark-theme') {
        overrides = {
          legend: {
            labels: { fontColor: 'white' }
          },
          scales: {
            xAxes: [{
              ticks: { fontColor: 'white' },
              gridLines: { color: 'rgba(255,255,255,0.1)' }
            }],
            yAxes: [{
              ticks: { fontColor: 'white' },
              gridLines: { color: 'rgba(255,255,255,0.1)' }
            }]
          }
        };
      } else {
        overrides = {};
      }
      this.themeService.setColorschemesOptions(overrides);
    });
  }

  /*
      Move to user profile
  */
  public employeeProfileOpen(): void {
    const data: any = localStorage.getItem(localstorageconstants.USERDATA);
    var mapData = JSON.parse(data);
    this.router.navigateByUrl('/employee-view/' + mapData.UserData._id);
  }

  /*
      Move to help page
  */
  public helpPageAction(): void {
    this.router.navigateByUrl('/helppage');
  }

  /*
      Move to change password page
  */
  public changePasswordPageAction(): void {
    this.router.navigateByUrl('/changepassword');
  }

  /*
      Move to Terms page
  */
  public termsPageAction(): void {
    this.router.navigateByUrl('/termspage');
  }

  // public vendorall(): void {
  //   this.router.navigateByUrl('vendor/vendor-dashboard');
  // }

  epicFunction() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
  }

  /*
    Logout function
  */
  logout() {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Do_Want_logout,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.logut_button,
      denyButtonText: this.stay_button,
    }).then((result) => {
      if (result.isConfirmed) {

        that.uiSpinner.spin$.next(true);
        let usertype = sessionStorage.getItem(localstorageconstants.USERTYPE);

        if (usertype == "superadmin") {
          that.uiSpinner.spin$.next(false);
          that.router.navigateByUrl('/superadmin/login');
        }
        else {
          let userdata: any = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
          if (userdata.UserData.role_name != configdata.EMPLOYEE) {
            this.logoutHistory();
          } else {
            that.uiSpinner.spin$.next(false);
            localStorage.setItem("invocelogout", "true");
            that.router.navigateByUrl('/login');
            that.authservice.signPortalOut();
          }
        }
      }
      else {

      }
    });
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
            that.router.navigateByUrl('/login');
            that.authservice.signPortalOut();
          }
          else {
            that.snackbarservice.openSnackBar(params.message, 'error');
            that.uiSpinner.spin$.next(false);
            that.authservice.signPortalOut();
          }
        });
      })
      .catch((data) => {
      });
  }
}
