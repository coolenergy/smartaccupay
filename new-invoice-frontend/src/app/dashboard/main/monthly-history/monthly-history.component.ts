import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexTitleSubtitle, ApexGrid, ApexMarkers, ApexResponsive } from 'ng-apexcharts';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
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

const historyColors = ['#008FFB', '#E1E0E0', '#F44336'];

@Component({
  selector: 'app-monthly-history',
  templateUrl: './monthly-history.component.html',
  styleUrls: ['./monthly-history.component.scss']
})
export class MonthlyHistoryComponent {
  showHistoryChart = true;
  @Input() chart!: ApexChart;
  public historyChartOptions: Partial<ChartOptions> = {
    chart: {
      height: 350,
      type: 'bar',
      stacked: true,
      id: 'salesChart',
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

  constructor(private router: Router, public translate: TranslateService, private commonService: CommonService) {
    this.monthlyHistoryChart();
  }

  getBase64Image() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgElement: SVGGraphicsElement =
        document.querySelector('.apexcharts-svg')!;
      const imageBlobURL =
        'data:image/svg+xml;charset=utf-8,' +
        encodeURIComponent(svgElement.outerHTML);
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

  async monthlyHistoryChart() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DASHBOARD_MONTHLY_HISTORY_CHART, { data_type: 'all' });
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
  }

  async downloadHistoryChart() {
    const docDefinition: any = {
      content: [
        {
          text: 'Monthly Invoice',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(),
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
          text: 'Monthly Invoice',
          fontSize: 14,
        },
        {
          image: await this.getBase64Image(),
          width: 500
        },
      ],
    };
    pdfMake.createPdf(docDefinition).print();
  }

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }
}
