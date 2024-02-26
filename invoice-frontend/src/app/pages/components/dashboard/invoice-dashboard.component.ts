/*
 *
 * Rovuk A/P
 *
 * This component is used for Display all 8 charts on dashboard in 3 x 3 grid
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { MMDDYYYY, MMDDYYYY_formet } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../map/mode-detect.service';

var chartColors = {
  red: '#f50000',
  orange: 'rgb(255, 159, 64)',
  yellow: '#dbdb06',
  green: '#07b536',
  blue: '#0735b5',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
};
@Component({
  selector: 'app-invoice-dashboard',
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.scss']
})
export class InvoiceDashboardComponent implements OnInit {
  mode: any;
  counts: any = {
    pending_files: 0,
    pending_invoices: 0,
    approved_invoices: 0,
    rejected_invoices: 0,
    late_invoices: 0,
  };
  cardList: any = {
    pending: [],
    process: [],
    cancelled: [],
  };;
  subscription!: Subscription;
  timePeriods: any = [
    "app-totalprojectvalue",
    "app-totalnumber-discipline",
    "app-dailyreport-by-status",
    "app-contractvalue-by-prime",
    "app-totalvalueby-minority",
    "app-totalminority-contract",
    "app-totalContractvalueMinority",
    "app-paymentperproject"
  ];
  id!: string;
  dashboardHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;

  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;


  public barChartOptions: ChartOptions = {
    responsive: true,
    showLines: false,
    plugins: {
    },

    scales: {
      yAxes: [{
        ticks: {
          stepSize: 1,
          min: 0,
        },
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,

        }
      }],
    }
  };

  public barChartLabels: Label[] = ['February', 'January', 'December', 'November', 'October'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [

  ];
  showChart: boolean = true;
  /*
    constructor
  */

  constructor(private router: Router, public translate: TranslateService, private modeService: ModeDetectService, public httpCall: HttpCall) {

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
      } else {
        this.mode = 'on';
      }
    });
  }
  locallanguage: any;
  local_user: any;
  list_id: any;

  /*
   ngOnInit
  */

  ngOnInit(): void {
    let that = this;

    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);

    this.local_user = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).UserData;

    this.translate.stream(['']).subscribe((textarray) => {
    });
    that.getChartData();
    that.getTodaysActivity();
    that.getCount();
    that.getCardData();
  }

  gotoFilesList() {
    this.router.navigate(['/dashboard-files-list']);
  }

  gotoList(status) {
    this.router.navigate(['/dashboard-invoice-list'], { queryParams: { status: status } });
  }
  gotoEditInvoice(invoice) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id, pdf_url: invoice.pdf_url } });
  }

  drop(event: CdkDragDrop<string[]>) {
    let tmp = moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
    this.saveChartList(this.timePeriods);
  }

  // Get user saved order for chart list
  getChartList() {
    let self = this;
    this.httpCall.httpPostCall(httproutes.GET_CHART_LIST, { user_id: this.local_user._id }).subscribe(params => {
      if (params.status) {

        if (params.data != null) {
          self.list_id = params.data._id;
          self.timePeriods = params.data.chart_list;
        }
      }
    });
  }

  getCount() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_DASHBOARD_COUNT_GETDATA).subscribe(function (params) {
      if (params.status) {
        that.counts = params.data;
      }
    });
  }

  getChartData() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.PORTAL_DASHBOARD_GET_CHART_DATA, { data_type: 'top' }).subscribe(function (params) {
      if (params.status) {
        let tempData = [];
        for (let i = 0; i < params.data.length; i++) {
          tempData.push({ data: params.data[i].data, label: params.data[i].status });
        }
        that.barChartLabels = params.month;
        that.barChartData = tempData;
        that.showChart = false;
        setTimeout(() => {
          that.showChart = true;
        }, 100);
      }
    });
  }

  getCardData() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_DASHBOARD_CARD_COUNT_GETDATA).subscribe(function (params) {
      if (params.status) {
        that.cardList = params.data;
      }
    });
  }
  // Save chart order list for Dashboard
  saveChartList(timePeriods: any) {
    let self = this;
    let reqObject = {
      _id: self.list_id,
      chart_list: timePeriods,
      user_id: this.local_user._id
    };
    this.httpCall.httpPostCall(httproutes.SAVE_CHART_LIST, reqObject).subscribe(params => {

    });
  }

  temp_MMDDYYY(epoch) {
    return MMDDYYYY(epoch);
  }

  // history listing apis
  goToUserProfile(user_id) {
    this.router.navigateByUrl('/employee-view/' + user_id.user_id);

  }
  goToInvoiceForm(item) {
    if (item.module == 'Invoice') {

      this.router.navigate(['/invoice-form'], { queryParams: { _id: item.data_id, pdf_url: item.invoice.pdf_url } });
    } if (item.module == 'Vendor') {
      this.router.navigate(['/vendor-form'], { queryParams: { _id: item.data_id } });
    } if (item.module == 'User') {
      this.router.navigate(['/employee-view'], { queryParams: { _id: item.data_id } });
    }
  }
  onKey(event: any) {
    if (event.target.value.length == 0) {
      this.dashboardHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }
  searchActivity() {
    let that = this;
    that.isSearch = true;
    that.dashboardHistory = [];
    that.start = 0;
    this.getTodaysActivity();
  }

  onScroll() {
    this.start++;
    this.getTodaysActivity();
  }

  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;
    let requestObject = {};

    requestObject = {
      start: this.start,
    };
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_DASHBOARD_HISTORY, requestObject)
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            self.is_httpCall = false;
          self.dashboardHistory = self.dashboardHistory.concat(params.data);
        }
      });
  }

  tmp_date(epoch: any) {
    return MMDDYYYY_formet(epoch);
  }

  setHeightStyles() {
    let styles = {
      height: "520px",

      "overflow-y": "scroll",
    };
    return styles;
  }
}
