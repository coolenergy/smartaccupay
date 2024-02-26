/*
 *
 * Rovuk A/P
 *
 * This class is the main header of the theme color which have action like
 * Weather, Shortcuts and User menu.
 * Language option id commented out in Rovuk A/P
 * Side Menu icon for Hide/Show the menu
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 * 
 */

import { Component, OnInit, Input, Inject, ViewEncapsulation } from '@angular/core';
import { LayoutService } from '../../../shared/services/layout.service';
import { Mostusedservice } from './../../../service/mostused.service';
import { Router } from '@angular/router';
import { httproutes, icon, localstorageconstants, routes } from 'src/app/consts';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../components/map/mode-detect.service';
import { HttpHeaders } from '@angular/common/http';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() navLayout: any;
  @Input() defaultNavbar: any;
  @Input() toggleNavbar: any;
  @Input() toggleStatus: any;
  @Input() navbarEffect: any;
  @Input() deviceType: any;
  @Input() headerColorTheme: any;
  @Input() leftHeaderColorTheme: any;
  @Input() navbarColorTheme: any;
  @Input() activeNavColorTheme: any;
  @Input() headerHeight: any;
  @Input() collapsedLeftHeader: any;

  weatherIcon = icon.WEATHERLIGHT_ICON;
  public weatherShow: boolean = false;
  public weatherToday: any = {
    iconFile: `<img src="${this.weatherIcon}" alt="" height="20px">`
  };

  public routers: typeof routes = routes;
  public usertype: any;
  AddressbookIcon = icon.CONTACTINFORMATION_WHITE;
  company_code: any = "";
  company_logo: any = "../assets/images/placeholder_logo.png";
  asidebarHeight: any;
  title: any;



  constructor(private router: Router, private layoutService: LayoutService,
    public dialog: MatDialog,
    public mostusedservice: Mostusedservice) {
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "invoice-portal";
    // This code is commented out since we are reaching the daily weather requestes. 
    // For localhost we are not call this weather apis first.
    // Now updated that no need to change icon dynamic on header the fixed icon will fine 
    // so, below api call is not require for set dynamic icons.
    // if (window.location.hostname != "localhost") {
    //   if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(position => {
    //       var currLat = position.coords.latitude;
    //       var currLng = position.coords.longitude;
    //       var that = this;
    //       this.servicefoeweatherui.getcityweather(currLat, currLng).subscribe(function (data: any) {
    //         if (data.weather[0].id < 300) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-storm-showers icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_thunderstorm_wea;
    //         } else if (data.weather[0].id < 400) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-showers icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_raindrops_wea;
    //         } else if (data.weather[0].id < 600) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-snowflake-cold icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_rain_wea;
    //         } else if (data.weather[0].id < 700) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-cloudy-windy icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_day_snow_wea;
    //         } else if (data.weather[0].id < 800) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-fog icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_fog_wea;
    //         } else if (data.weather[0].id == 800) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-day-sunny icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_wu_clear_wea;
    //         } else if (data.weather[0].id <= 804) {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-day-cloudy icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.wi_cloud_wea;
    //         } else {
    //           that.weatherToday = {
    //             temp_max: Math.round(data.main.temp_max),
    //             iconFile: `<i class="wi wi-day-cloudy-gusts icon-cust-headr"></i>`
    //           };
    //           //return FlutterIcons.weather_night_mco;
    //         }
    //         that.weatherShow = true;
    //       });
    //     });
    //   }
    //   else {
    //     alert("Geolocation is not supported by this browser.");
    //   }
    // }

  }

  ngOnInit() {
    this.layoutService.setAsidebarHeightCast.subscribe(
      (setSidebarHeight) => (this.asidebarHeight = setSidebarHeight)
    );
    let self = this;
    var company_data = JSON.parse(
      localStorage.getItem(localstorageconstants.USERDATA) ?? ''
    );
    this.company_logo = company_data.companydata.companylogo;
    this.company_code = company_data.companydata.companycode;
    this.title = "Navigation";
    this.mostusedservice.updatecompnayUserEmit$.subscribe(function (
      params: any
    ) {
      var company_data = JSON.parse(
        localStorage.getItem(localstorageconstants.USERDATA) ?? ''
      );
      self.company_logo = company_data.companydata.companylogo;
      self.company_code = company_data.companydata.companycode;
    });
  }

  /*
    Side menu button action to Hide/show Side menu.
  */
  changeTheToggleStatus() {
    this.layoutService.getToggleStatus();
  }

  moveToDashboard() {
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "portal";
    if (this.usertype == "portal") {
      this.router.navigate([this.routers.DASHBOARD]).then();
    } else {
      this.router.navigate([this.routers.SUERADMINDASHBOARD]).then();
    }
  }

  addressbookdialog() {
    let that = this;
    const dialogRef = this.dialog.open(AddressBook, {
      height: '500px',
      width: '1000px',
      data: "",
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  public signOut(): void { }
}

@Component({
  selector: 'addressbook',
  templateUrl: './addressbook.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AddressBook implements OnInit {
  showTable: boolean = true;
  showTableTwo: boolean = true;
  userList: any;
  vendorList: any;
  dtOptions: DataTables.Settings = {};
  dtOptionsvendor: DataTables.Settings = {};
  emailIcon: string;
  callIcon: string;
  mode: any;
  subscription: Subscription;
  exitIcon: string;



  constructor(
    public dialogRef: MatDialogRef<AddressBook>,
    @Inject(MAT_DIALOG_DATA) public data: any, private modeService: ModeDetectService, public translate: TranslateService, public httpCall: HttpCall,) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.emailIcon = icon.EMAIL;
      this.callIcon = icon.EMERGENCY_CONTACT;
      this.exitIcon = icon.CANCLE;

    } else {
      this.emailIcon = icon.EMAIL;
      this.callIcon = icon.EMERGENCY_CONTACT;
      this.exitIcon = icon.CANCLE_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.emailIcon = icon.EMAIL;
        this.callIcon = icon.EMERGENCY_CONTACT;
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = 'on';
        this.emailIcon = icon.EMAIL;
        this.callIcon = icon.EMERGENCY_CONTACT;
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });
  }
  ngOnInit(): void {

    const that = this;
    const token = localStorage.getItem('token');
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    var tmp_locallanguage = localStorage.getItem("sitelanguage");
    tmp_locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {

    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      "columnDefs": [
        {
          "targets": [], //first column / numbering column
          "orderable": false, //set not orderable
        }
      ]
    };
    this.dtOptionsvendor = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      "columnDefs": [
        {
          "targets": [], //first column / numbering column
          "orderable": false, //set not orderable
        }
      ]
    };
    this.getAllUserList();
    this.getAllVendorList();

  }
  async getAllUserList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_GET_ALL_USERS).toPromise();
    if (data.status) {
      this.userList = data.data;
      this.showTable = false;
      setTimeout(() => {
        this.showTable = true;
      }, 100);
    }
  }

  async getAllVendorList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_COMPANY_VENDOR_GET_BY_ID).toPromise();
    if (data.status) {
      this.vendorList = data.data;
      this.showTableTwo = false;
      setTimeout(() => {
        this.showTableTwo = true;
      }, 100);
    }
  }
}
