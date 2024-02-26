import { Component, ViewChild } from '@angular/core';
import {
  ApexTitleSubtitle,
  ApexMarkers,
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexYAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexLegend,
  ApexFill,
  ApexResponsive,
  ApexGrid,
} from 'ng-apexcharts';
import { NgxGaugeType } from 'ngx-gauge/gauge/gauge';

import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { Router } from '@angular/router';
import { Invoice } from 'src/app/invoice/invoice.model';
import { numberWithCommas } from 'src/consts/utils';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake!.vfs = pdfFonts.pdfMake.vfs;

export type ChartOptions = {
  series?: ApexAxisChartSeries;
  series2?: ApexNonAxisChartSeries;
  chart?: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  xaxis?: ApexXAxis;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  stroke?: ApexStroke;
  legend?: ApexLegend;
  title?: ApexTitleSubtitle;
  colors?: string[];
  grid?: ApexGrid;
  markers?: ApexMarkers;
  labels: string[];
  responsive: ApexResponsive[];
};

const invoiceColors = ['#C5B7FF', '#94D4FE', '#FF99B1'];
const historyColors = ['#008FFB', '#E1E0E0', '#F44336'];

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  @ViewChild('chart') chart?: ChartComponent;
  showInvoiceChart = true;
  public invoiceChartOptions: Partial<ChartOptions> = {
    chart: {
      id: 'line',
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: false,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 1,
      },
      toolbar: {
        show: false,
      },
      foreColor: '#9aa0ac',
    },
    xaxis: {
      categories: ['Mar', 'Apr', 'May'],
      title: {
        text: 'Month',
      },
      labels: {
        style: {
          colors: '#9aa0ac',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Invoice',
      },
      labels: {
        style: {
          colors: ['#9aa0ac'],
        },
      },
    },
    stroke: {
      curve: 'smooth',
    },
    series: [
      {
        name: 'Pending Invoice',
        data: [0, 0, 0],
        color: '#C5B7FF',
      },
      {
        name: 'Approved Invoice',
        data: [0, 0, 0],
        color: '#94D4FE',
      },
      {
        name: 'Rejected Invoice',
        data: [0, 0, 0],
        color: '#FF99B1',
      },
    ],
    tooltip: {
      theme: 'dark',
      marker: {
        show: true,
      },
      x: {
        show: true,
      },
    },
    legend: {
      position: 'bottom',
      offsetY: 0,
    },
  };

  showHistoryChart = true;
  public historyChartOptions: Partial<ChartOptions> = {
    chart: {
      id: 'bar',
      height: 350,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      foreColor: '#9aa0ac',
    },
    series: [
      {
        name: 'Paid',
        data: [0, 0, 0],
        color: '#008FFB',
      },
      {
        name: 'On Hold',
        data: [0, 0, 0],
        color: '#E1E0E0',
      },
      {
        name: 'Rejected',
        data: [0, 0, 0],
        color: '#F44336',
      },
    ],
    xaxis: {
      categories: ['Mar', 'Apr', 'May'],
      title: {
        text: 'Month',
      },
      labels: {
        style: {
          colors: '#9aa0ac',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: ['#9aa0ac'],
        },
        formatter: function (value) {
          return "$" + value.toFixed(2);
        }
      },
    },
    legend: {
      position: 'bottom',
      offsetY: 0,
    },
    dataLabels: {
      enabled: false,
    },
  };

  gaugeType = 'arch' as NgxGaugeType;
  gaugeValue = 48;
  gaugeSize = 170;
  guageThick = 16;
  thresholdConfig = {
    0: { color: 'green' },
    40: { color: 'orange' },
    75.5: { color: 'red' },
  };
  gaugeType2 = 'arch' as NgxGaugeType;
  gaugeValue2 = 34;
  gaugeSize2 = 170;
  guageThick2 = 16;
  thresholdConfig2 = {
    0: { color: 'green' },
    40: { color: 'orange' },
    75.5: { color: 'red' },
  };

  jobCostList: any = [];
  pendingInvoices: any = [];
  rejectedInvoices: any = [];
  processedInvoices: any = [];
  countData: any = {
    pending_documents: 0,
    pending_invoices: 0,
    approved_invoices: 0,
    rejected_invoices: 0,
    overdue: 0,
    on_hold: 0,
    duplicates: 0,
  };

  constructor(private commonService: CommonService, private router: Router,) {
    this.getDashboardInvoice();
    this.monthlyInvoiceChart();
    this.monthlyHistoryChart();
    this.getInvoiceCounts();
    this.getDashboardJobCost();
  }

  async getDashboardInvoice() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_DASHBOARD_INVOICE);
    if (data.status) {
      this.pendingInvoices = data.data.pending_invoices;
      this.rejectedInvoices = data.data.cancelled_invoices;
      this.processedInvoices = data.data.process_invoices;
    }
  }

  async monthlyInvoiceChart() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DASHBOARD_MONTHLY_INVOICE_CHART, { data_type: 'top' });
    if (data.status) {
      this.invoiceChartOptions.xaxis!.categories = data.month;
      const series = [];
      for (let i = 0; i < data.data.length; i++) {
        series.push({
          name: data.data[i].status,
          data: data.data[i].data,
          color: invoiceColors[i],
        });
      }
      this.invoiceChartOptions.series = series;
      this.showInvoiceChart = false;
      setTimeout(() => {
        this.showInvoiceChart = true;
      }, 100);
    }
  }

  async monthlyHistoryChart() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DASHBOARD_MONTHLY_HISTORY_CHART, { data_type: 'top' });
    if (data.status) {
      this.historyChartOptions.xaxis!.categories = data.month;
      const series = [];
      for (let i = 0; i < data.data.length; i++) {
        series.push({
          name: data.data[i].status,
          data: data.data[i].data,
          color: historyColors[i],
        });
      }
      this.historyChartOptions.series = series;
      this.showHistoryChart = false;
      setTimeout(() => {
        this.showHistoryChart = true;
      }, 100);
    }
  } async getDashboardJobCost() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_DASHBOARD_JOB_COST);
    if (data.status) {
      this.jobCostList = data.data;
    }
  }

  viewMonthlyInvoiceChart() {
    this.router.navigate([WEB_ROUTES.DASHBOARD_MONTHLY_INVOICE]);
  }

  async downloadMonthlyInvoiceChart() {
    const docDefinition: any = {
      content: [
        {
          text: 'Monthly Invoice',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(true),
          width: 500
        },
      ],
    };
    pdfMake.createPdf(docDefinition).open();
  }

  getBase64Image(isInvoice: boolean) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement =
        document.querySelectorAll('.apexcharts-svg')!;
      let str = ''
      if (isInvoice) {
        str = svgElement[0].outerHTML;
      } else {
        str = svgElement[1].outerHTML;
      }
      const imageBlobURL =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(str);
      img.onload = () => {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imageBlobURL;
    });
  }

  async printMonthlyInvoiceChart() {
    const docDefinition: any = {
      content: [
        {
          text: 'Monthly Invoice',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(true),
          width: 500
        },
      ],
    };
    pdfMake.createPdf(docDefinition).print();
  }

  viewHistoryChart() {
    this.router.navigate([WEB_ROUTES.DASHBOARD_MONTHLY_HISTORY]);
  }

  async downloadHistoryChart() {
    const docDefinition: any = {
      content: [
        {
          text: 'Monthly History',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(false),
          width: 500
        },
      ],
    };
    pdfMake.createPdf(docDefinition).open();
  }

  async printHistoryChart() {
    const docDefinition: any = {
      content: [
        {
          text: 'Monthly History',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(false),
          width: 500
        },
      ],
    };
    pdfMake.createPdf(docDefinition).print();
  }

  invoiceDetail(invoice: Invoice) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: invoice._id } });
  }

  viewInvoice(type: string) {
    if (type == 'Duplicate') {
      this.router.navigate([WEB_ROUTES.DASHBOARD_DUPLICATE_DOCUMENTS]);
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE], { queryParams: { type: type } });
    }
  }

  viewUnknwon() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_DOCUMENTS], { state: { value: 4 } });
  }

  async getInvoiceCounts() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_DASHBOARD_INVOICE_COUNTS);
    if (data.status) {
      this.countData = data.data;
    }
  }

  numberWithCommas(amount: number) {
    return numberWithCommas(amount.toFixed(2));
  }
}

