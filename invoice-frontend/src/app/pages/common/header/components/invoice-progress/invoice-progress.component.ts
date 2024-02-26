import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { configdata } from 'src/environments/configData';




@Component({
  selector: 'app-invoice-progress',
  templateUrl: './invoice-progress.component.html',
  styleUrls: ['./invoice-progress.component.scss']
})
export class InvoiceProgressComponent implements OnInit {
  @ViewChild("menuTrigger") trigger: MatMenuTrigger;

  public useremail: string;
  public companycode: string;
  progressIcon = icon.HISTORY_WHITE;
  selectedList: any;
  otherAppObject: any = [];
  //color_array: any = ['#536DFE', '#53abfe', '#5e53fe', '#33ccff', '#8f53fe', '#ea53fe', '#fe53a9', '#fe5353', '#ea53fe', '#fe53a9'];

  start: number = 0;
  is_httpCall: boolean = false;
  progressList = [];
  unseen_count: number = 0;

  mode: any;
  subscription: Subscription;

  showAllNotification: Boolean = true;
  events: EventSource;

  constructor (
    public dialog: MatDialog,
    private router: Router,
    public httpCall: HttpCall, private _zone: NgZone,
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
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    var userId = user_data.UserData._id;
    var companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE);

    var userId = user_data.UserData._id;
    var companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE);
    var url = configdata.apiurl + httproutes.PORTAL_GET_INVOICE_PROGRESS + `/${companyCode}/${userId}`;
    this.events = new EventSource(url);
    this.events.onmessage = (event: any) => {
      const parsedData = JSON.parse(event.data);
      this.progressList = parsedData.data;
      if (parsedData.completed) {
        this._zone.run(() => {
          this.events.close();
        });

      }
    };
  }
  closeEvent() {
    this.events = null;
  }

  onScroll() {
    this.start++;
    // this.getData();
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }
  setProgressBar(ratio) {
    return { width: `${ratio * 100}%` };
  }
}


