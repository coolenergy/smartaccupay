import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexTitleSubtitle, ApexGrid, ApexMarkers, ApexResponsive } from 'ng-apexcharts';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
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

const colors = ['#C5B7FF', '#94D4FE', '#FF99B1'];

@Component({
  selector: 'app-monthly-invoice',
  templateUrl: './monthly-invoice.component.html',
  styleUrls: ['./monthly-invoice.component.scss']
})
export class MonthlyInvoiceComponent {
  showInvoiceChart = true;
  public invoiceChartOptions: Partial<ChartOptions> = {
    chart: {
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
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
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
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#C5B7FF',
      },
      {
        name: 'Approved Invoice',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        color: '#94D4FE',
      },
      {
        name: 'Rejected Invoice',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5,
    },
  };
  chartdiv: HTMLElement | any;
  printWindow: Window | any;

  constructor(private commonService: CommonService, private router: Router, public translate: TranslateService, private _sanitizer: DomSanitizer) {
    this.monthlyInvoiceChart();
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

  async monthlyInvoiceChart() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DASHBOARD_MONTHLY_INVOICE_CHART, { data_type: 'all' });
    if (data.status) {
      this.invoiceChartOptions.xaxis!.categories = data.month;
      const series = [];
      for (let i = 0; i < data.data.length; i++) {
        series.push({
          name: data.data[i].status,
          data: data.data[i].data,
          color: colors[i],
        });
      }
      /*  {
          name: 'Pending Invoice',
          data: [28, 29, 33, 36, 32, 32, 33, 12, 11, 14, 36, 24],
          color: '#C5B7FF',
        },
        {
          name: 'Approved Invoice',
          data: [12, 11, 14, 18, 17, 13, 13, 20, 51, 19, 16, 12],
          color: '#94D4FE',
        },
        {
          name: 'Rejected Invoice',
          data: [21, 15, 13, 61, 28, 33, 23, 28, 29, 33, 36, 32],
          color: '#FF99B1',
        }, */
      console.log("series: ", series);
      this.invoiceChartOptions.series = series;
      this.showInvoiceChart = false;
      setTimeout(() => {
        this.showInvoiceChart = true;
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

    // const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    // chart.render().then(() => {
    //   window.setTimeout(function () {
    //     chart.dataURI().then((uri: any) => {
    //       console.log(uri.imgURI);
    //       const downloadLink = document.createElement('a');
    //       const fileName = 'Monthly Invoice Chart.png';

    //       downloadLink.href = uri.imgURI;
    //       downloadLink.download = fileName;
    //       downloadLink.click();
    //       // downloadLink.remove();
    //       /*  window.setTimeout(function () {
    //           // downloadLink.remove();
    //         }, 1000); */

    //       /*  const blob = new Blob([uri.imgURI], { type: "image/png" });
    //        console.log(blob); 

    //        saveAs(blob, 'attachment'); */
    //       /* const img = new Image();
    //       img.src = uri.imgURI;

    //       const winparams =
    //         "dependent=yes,locationbar=no,scrollbars=yes,menubar=yes," +
    //         "resizable,screenX=50,screenY=50,width=850,height=1050";

    //       const htmlPop =
    //         "<embed width=100% height=100%" +
    //         ' type="image/png"' +
    //         ' src="' +
    //         uri.imgURI +
    //         '" ' +
    //         '"></embed>';

    //       this.printWindow = window.open("", "PDF", winparams);
    //       this.printWindow.document.write(htmlPop);
    //       this.printWindow.print();
    //       this.loadingBuffer = false; */
    //     });
    //   }, 2500);
    // });



    /* const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      window.setTimeout(function () {
        chart.dataURI().then((uri: any) => {
          // console.log(uri.imgURI);
          const downloadLink = document.createElement('a');
          const fileName = 'Monthly Invoice Chart.png';

          downloadLink.href = uri.imgURI;
          downloadLink.download = fileName;

          downloadLink.click();
          window.setTimeout(function () {
            document.body.removeChild(downloadLink);
          }, 1000);
        });
      }, 1500);
    }); */
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

    /* console.log(window.ApexCharts._chartInstances);
    const chartInstance = window.ApexCharts._chartInstances.find(
      (chart: any) => chart.id === 'chart'
    );

    const base64 = await chartInstance.chart.dataURI();
    const downloadLink = document.createElement("a");  
    downloadLink.href = base64.imgURI;
    downloadLink.download = "image.png";

    // Add the anchor element to the document
    document.body.appendChild(downloadLink);

    // Simulate a click event to initiate the download
    downloadLink.click();

    // Remove the anchor element from the document
    document.body.removeChild(downloadLink); */
    // const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    // chart.render().then(() => {
    //   window.setTimeout(function () {
    //     chart.dataURI().then((uri: any) => {
    //       console.log(uri.imgURI);
    //     });
    //   }, 1000);
    // });
    /* const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      chart.dataURI().then((uri: any) => {  // Here shows an error
        console.log(uri);
        const downloadLink = document.createElement('a');
        const fileName = 'sample.png';

        downloadLink.href = uri.imgURI;
        downloadLink.download = fileName;
        downloadLink.click(); 
      });
    }); */
  }
  /* this.chartdiv = document.getElementById("chartdiv");
  this.chartdiv.style.display = "block";
  this.chartdiv.classList.add("modal-chart");

  domtoimage
    .toPng(this.chartdiv)
    .then(function (dataUrl: any) {
      const img = new Image();
      img.src = dataUrl;

      const winparams =
        "dependent=yes,locationbar=no,scrollbars=yes,menubar=yes," +
        "resizable,screenX=50,screenY=50,width=850,height=1050";

      const htmlPop =
        "<embed width=100% height=100%" +
        ' type="image/png"' +
        ' src="' +
        dataUrl +
        '" ' +
        '"></embed>';

      this.printWindow = window.open("", "PDF", winparams);
      this.printWindow.document.write(htmlPop);
      this.printWindow.print();
      this.loadingBuffer = false;
    })

    .catch(function () {
      this.loadingBuffer = false;
      // console.error('oops, something went wrong!', error);
    });
} */

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }
}
