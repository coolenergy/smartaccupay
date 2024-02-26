import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import _ from 'lodash';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants, httproutes } from 'src/app/consts';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { notificationDateTime, notificationRoutes } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
const EventSource: any = window['EventSource'];

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  @ViewChild("menuTrigger") trigger: MatMenuTrigger;

  public useremail: string;
  public companycode: string;
  notificationIcon = icon.NOTIFICATION;
  selectedList: any;
  otherAppObject: any = [];
  //color_array: any = ['#536DFE', '#53abfe', '#5e53fe', '#33ccff', '#8f53fe', '#ea53fe', '#fe53a9', '#fe5353', '#ea53fe', '#fe53a9'];

  start: number = 0;
  is_httpCall: boolean = false;
  notificationList = [];
  temp_notificationList = [];
  unseen_count: number = 0;

  mode: any;
  subscription: Subscription;

  showAllNotification: Boolean = true;

  constructor (
    public dialog: MatDialog,
    private router: Router,
    public httpCall: HttpCall,
    private modeService: ModeDetectService
  ) {
    let user_date = JSON.parse(
      localStorage.getItem(localstorageconstants.USERDATA)
    );
    this.useremail = user_date.UserData.useremail;
    this.companycode = user_date.companydata.companycode;

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
      } else {
        this.mode = "on";
      }
    });
  }

  ngOnInit(): void {
    this.getData();

    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    var userId = user_data.UserData._id;
    var companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE);
    var url = configdata.apiurl + httproutes.PORTAL_GET_UNSEEN_ALERT_COUNT + `/${companyCode}/${userId}`;
    const events = new EventSource(url);
    events.onmessage = (event: any) => {
      const parsedData = JSON.parse(event.data);
      this.unseen_count = parsedData.unseen_count;
    };
  }

  onScroll() {
    this.start++;
    this.getData();
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }

  getData() {
    let that = this;
    this.is_httpCall = true;

    //this.uiSpinner.spin$.next(true)
    this.httpCall
      .httpPostCall(httproutes.PORTAL_GET_ALL_ALERTS, {
        start: this.start,
      })
      .subscribe(function (params) {
        if (params.status) {
          that.is_httpCall = false;
          // if (that.start == 0) {
          that.notificationList = that.notificationList.concat(params.data);
          that.temp_notificationList = that.notificationList;
          // }
        }
      });
  }

  openPage(event) {
    let that = this;
    if (!event.is_seen) {
      this.httpCall
        .httpPostCall(httproutes.PORTAL_UPDATE_ALERT, {
          _id: event._id,
          is_seen: true,
        })
        .subscribe(function (params) {
          if (params.status) {
            that.start = 0;
            that.notificationList = [];
            that.getData();
          }
        });
    }
    let result = _.find(notificationRoutes(), [
      "name",
      event.module_name,
    ]);
    if (result) {
      if (event.tab_index) {
        if (event.tab_index != -1) {
          this.router
            .navigate([result.url], {
              queryParams: event.module_route,
              state: { value: event.tab_index },
            })
            .then();
        } else {
          this.router
            .navigate([result.url], { queryParams: event.module_route })
            .then();
        }
      } else {
        this.router
          .navigate([result.url], { queryParams: event.module_route })
          .then();
      }
    }
    this.trigger.closeMenu();
  }

  seenAction(event, index) {
    let that = this;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_UPDATE_ALERT, {
        _id: event._id,
        is_seen: !event.is_seen,
      })
      .subscribe(function (params) {
        if (params.status) {
          that.temp_notificationList[index].is_seen =
            !that.temp_notificationList[index].is_seen;
          if (that.temp_notificationList[index].is_seen) {
            that.unseen_count--;
          } else {
            that.unseen_count++;
          }
        }
        that.notificationList = that.temp_notificationList;
      });
  }

  completeAction(event, index) {
    let that = this;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_UPDATE_ALERT, {
        _id: event._id,
        is_complete: !event.is_complete,
      })
      .subscribe(function (params) {
        if (params.status) {
          that.temp_notificationList[index].is_complete = !that.temp_notificationList[index].is_complete;
        }
        that.notificationList = that.temp_notificationList;
      });
  }

  showNotification() {
    let that = this;
    that.showAllNotification = !that.showAllNotification;
    if (that.showAllNotification) {
      that.temp_notificationList = that.notificationList;
    } else {
      that.temp_notificationList = that.notificationList.filter((item: any) => {
        return item.is_seen == false;
      });
    }
  }

  seenAllNotification() {
    let that = this;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_UPDATE_ALL_ALERT, {
        is_seen: true,
      })
      .subscribe(function (params) {
        if (params.status) {
          for (let i = 0; i < that.notificationList.length; i++) {
            that.temp_notificationList[i].is_seen = true;
          }
          that.notificationList = that.temp_notificationList;
        }
      });
  }
  getRandom() {
    return Math.round(Math.random() * (9 - 0) + 0);
  }

  tmp_datetime(epoch) {
    return notificationDateTime(epoch);
  }
}