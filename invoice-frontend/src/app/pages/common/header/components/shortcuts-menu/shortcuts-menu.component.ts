/*
 *
 * Rovuk A/P
 *
 * This class is the use for mainatain shortcuts. 
 * Shortcuts are use to provide quick links to the modules. 
 * Shortcuts are maintain userwise.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Router } from '@angular/router';
import { configdata } from 'src/environments/configData';
import { Subscription } from 'rxjs/internal/Subscription';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';

@Component({
  selector: 'app-shortcuts-menu',
  templateUrl: './shortcuts-menu.component.html',
  styleUrls: ['./shortcuts-menu.component.scss']
})

export class ShortcutsMenuComponent implements OnInit {
  // Variable
  public useremail: string;
  public companycode: string;
  shortcutIcon = icon.SHORTCUTLIGHT_ICON;
  selectedList: any;
  otherAppObject: any = [];
  //color_array: any = ['#536DFE', '#53abfe', '#5e53fe', '#33ccff', '#8f53fe', '#ea53fe', '#fe53a9', '#fe5353', '#ea53fe', '#fe53a9'];

  /*
    Constructor
  */
  constructor(public dialog: MatDialog, private router: Router, public httpCall: HttpCall) {
    let user_date = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.useremail = user_date.UserData.useremail;
    this.companycode = user_date.companydata.companycode;
  }

  ngOnInit(): void {
    this.getData();
  }

  /*
    Get Shortcut data api call
  */
  getData() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.SHORTCUTS_GET).subscribe(function (params) {
      if (params.status) {
        if (params.data) {
          that.selectedList = params.data.shortcusts;
        }
        that.otherAppObject = params.otherApp;
        that.otherAppObject = that.otherAppObject.filter((person: any) => person.key != configdata.SITE_TYPE);
      }
    });
  }

  openmenuadd() {
    const dialogRef = this.dialog.open(ShortcutsAddComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getData();
    });
  }

  openpage(event: any) {
    this.router.navigate([event.url]).then();
  }

  getRandom() {
    return Math.round(Math.random() * (9 - 0) + 0);
  }
}

/*
 *
 * Rovuk A/P
 *
 * This class is the use for ADD/REMOVE shortcuts.
 * Shortcust needs to checked and save in popup dialog.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

@Component({
  selector: 'add-shortcuts',
  templateUrl: './add-shortcuts.html',
  styleUrls: ['./shortcuts-menu.component.scss']
})

export class ShortcutsAddComponent implements OnInit {
  // Variable
  menuList: any = [];
  menuInfo: FormGroup;
  public usertype: any;
  public userrole: any;
  public role_permission: any;
  update_id: any;
  selectedList: any = [];
  saveIcon = icon.SAVE_WHITE;
  public backIcon: string;
  mode: any;
  subscription: Subscription;

  /*
    Constructor
  */
  constructor(private modeService: ModeDetectService, public translate: TranslateService, public snackbarservice: Snackbarservice,
    public dialogRef: MatDialogRef<ShortcutsAddComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public httpCall: HttpCall) {
    this.menuInfo = new FormGroup({
      menu_object: new FormControl(),
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }
    });
  }

  /*
    ngOnInit
  */

  ngOnInit(): void {
    let that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.setDefaultLang(locallanguage);
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "invoice-portal";
    this.userrole = localStorage.getItem(localstorageconstants.USERROLE) ? localStorage.getItem(localstorageconstants.USERROLE) : 1;
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.translate.stream(["Sidebar-Dashboard", "Sidebar-Vendors", "iframe_tab_Documents", "Sidebar-invoice", "Sidebar-Templates", "Sidebar-Report",
      "Sidebar-Team", "Sidebar-Setting"]).subscribe((textarray) => {
        if (that.usertype == "invoice-portal") {
          that.menuList = [
            {
              name: textarray['Sidebar-Dashboard'],
              icon: 'fas fa-tachometer-alt',
              image: './assets/sidemenu/dashboard_icon.png',
              url: '/dashboard',
              tmp_name: "dashboard",
              language_tmp: "Sidebar-Dashboard",
              color: "#89CFF0"
            },
            {
              name: textarray['Sidebar-Vendors'],
              icon: 'fas fa-tachometer-alt',
              image: './assets/diversityicon/vendors_icon.png',
              url: '/vendors',
              tmp_name: "vendors",
              language_tmp: "Sidebar-Vendors",
              color: "#89CFF0"
            },
            {
              name: textarray['Sidebar-invoice'],
              icon: 'fas fa-stopwatch',
              image: './assets/sidemenu/dailyreport_icon.png',
              url: '/invoice',
              tmp_name: "invoice",
              language_tmp: "Sidebar-invoice",
              color: "#96DED1"
            },
            {
              name: textarray['iframe_tab_Documents'],
              icon: 'fas fa-file-pdf',
              image: './assets/sidemenu/document_dark.png',
              url: '/documents-list',
              tmp_name: "documents",
              language_tmp: "iframe_tab_Documents",
              color: "#2F2F4F"
            },
            {
              name: textarray['Sidebar-Report'],
              icon: 'fas fa-file-pdf',
              image: './assets/diversityicon/reports_white.png',
              url: '/reports',
              tmp_name: "reports",
              language_tmp: "Sidebar-Report",
              color: "#33ccff"
            },
            {
              name: textarray['Sidebar-Team'],
              icon: 'fas fa-users',
              image: './assets/sidemenu/users_icon.png',
              url: '/employee-list',
              tmp_name: "employee-list",
              language_tmp: "Sidebar-Team",
              color: "#FF7377"
            },
            {
              name: textarray['Sidebar-Setting'],
              icon: 'fas fa-cog',
              image: './assets/sidemenu/settings_icon.png',
              url: '/setting',
              tmp_name: "setting",
              language_tmp: "Sidebar-Setting",
              color: "#50A6C2"
            }
          ];

          if (that.role_permission.role_permission.settings.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'setting');
          }

          if (that.role_permission.role_permission.dashboard.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'dashboard');
          }

          if (that.role_permission.role_permission.todayActivity.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'todayactivity');
          }

          if (that.role_permission.role_permission.dailyReports.Add == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'report');
          }
        }
      });
    this.httpCall.httpGetCall(httproutes.SHORTCUTS_GET).subscribe(function (params) {
      if (params.status) {
        if (params.data) {
          that.update_id = params.data._id;
          that.menuInfo = new FormGroup({
            menu_object: new FormControl(params.data.shortcusts.map((el: any) => el.tmp_name)),
          });

        }

      }
    });
  }

  menu_change(event: any) {
    let that = this;
    this.selectedList = [];
    for (let m = 0; m < event.value.length; m++) {
      let obj = that.menuList.find((o: any) => o.tmp_name === event.value[m]);
      this.selectedList.push(obj);
    }
  }

  /*
    SAVE SHORTCUT BUTTON ACTION
    API call and save the shortcut for login user.
    Route: httproutes.SHORTCUTS_SAVE
    URL: /webapi/v1/portal/getshortcusts
  */

  saveData() {
    let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    let reqObject: any = {
      user_id: userData.UserData._id,
      shortcusts: this.selectedList
    };
    if (this.update_id) {
      reqObject['_id'] = this.update_id;
    }
    let that = this;
    this.httpCall.httpPostCall(httproutes.SHORTCUTS_SAVE, reqObject).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.dialogRef.close();
        that.selectedList = params.data.shortcusts;
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
      }
    });
  }
}

