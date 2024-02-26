import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import Swal from 'sweetalert2';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';

@Component({
  selector: 'app-iframe-customepdfviewer',
  templateUrl: './iframe-customepdfviewer.component.html',
  styleUrls: ['./iframe-customepdfviewer.component.scss']
})

export class IframeCustomepdfviewerComponent implements OnInit {
  @Input() data: any;
  pdf_url: any;

  backIcon: string;
  downloadIcon: string;
  printIcon: string;

  subscription: Subscription;
  mode: any;

  sponsor_id: any;
  vendorid: any;

  constructor(private location: Location, private modeService: ModeDetectService, public route: ActivatedRoute, private router: Router,
    public httpCall: HttpCall, public spinner: UiSpinnerService, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.sponsor_id = this.route.snapshot.paramMap.get('id');
    this.vendorid = this.route.snapshot.paramMap.get('vendorid');
    this.pdf_url = this.route.snapshot.queryParamMap.get('po_url');
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.downloadIcon = icon.DOWNLOAD;
      this.backIcon = icon.BACK;
      this.printIcon = icon.PRINT;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.printIcon = icon.PRINT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.downloadIcon = icon.DOWNLOAD;
        this.backIcon = icon.BACK;
        this.printIcon = icon.PRINT;
      } else {
        this.mode = 'on';
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.printIcon = icon.PRINT_WHITE;
      }
    });
  }

  back() {
    let co_id = this.route.snapshot.queryParamMap.get('change_order_id');
    if (co_id != null) {
      this.router.navigate(['/ocps-vendorprofile', this.sponsor_id, this.vendorid], { state: { value: 3 } });
    }
    else {
      this.location.back();
    }
  }

  print() {
    fetch(this.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {

      /*--- set the blog type to final pdf ---*/
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow!.print();
        });
      };
    });
  }

  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

  refresh() {
    let that = this;
    if (that.route.snapshot.queryParamMap.get('date') != null && that.route.snapshot.queryParamMap.get('project_id') != null && that.route.snapshot.queryParamMap.get('type') != null) {

      let reqObject = {
        "date": that.route.snapshot.queryParamMap.get('date'),
        "project_id": that.route.snapshot.queryParamMap.get('project_id'),
        "type": that.route.snapshot.queryParamMap.get('type'),
      };

      that.spinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.DAILY_REPORT_PROJECT_VIEW, reqObject).subscribe(function (params) {
        if (params.status) {
          that.spinner.spin$.next(false);
          that.pdf_url = params.url + "?date=" + new Date().getTime();
        }
      });
    }
  }

  ngOnInit(): void {
    this.refresh();
  }
}