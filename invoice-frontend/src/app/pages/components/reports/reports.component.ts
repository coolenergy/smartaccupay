import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { localstorageconstants, icon, httproutes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { gallery_options, LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../map/mode-detect.service';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  // dtOptions: any = {}; @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  dtOptions: any = {};
  imageObject: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  termList = [];
  locallanguage: string;
  showTable: boolean = true;
  invoice_no: string;
  po_no: string;
  packing_slip_no: string;
  Receiving_Slip: string;
  Receiving_Attachment: string;
  Vendor_Action: string;
  Vendor_Status: string;
  template_notes: string;
  gridtolist: Boolean = true;
  Vendor_Do_Want_Archive: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Listing_Action_Edit: string = "";
  Archived_all: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  archivedIcon: string;
  mode: any;
  historyIcon: string;
  reportIcon: string;
  exportIcon: string;
  subscription: Subscription;
  copyDataFromProject: string = "";
  yesButton: string = "";
  noButton: string = "";
  editIcon: string;
  approveIcon: string = "";
  rejectIcon: string = "";
  backIcon: string;
  viewIcon: string;
  Purchasing_Orders_View: any;
  listIcon!: string;
  gridIcon: string;
  reportinfo: FormGroup;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  count: number = 0;
  allInvoices: any = [];
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  showInvoiceTable = true;
  startDate: number = 0;
  endDate: number = 0;

  constructor(private modeService: ModeDetectService,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public route: ActivatedRoute,
    public translate: TranslateService) {


    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";

    if (this.mode == "off") {
      this.reportIcon = icon.REPORT;
      this.approveIcon = icon.APPROVE;
      this.rejectIcon = icon.DENY;
      this.backIcon = icon.BACK;
      this.editIcon = icon.EDIT;
      this.viewIcon = icon.VIEW;
      this.gridIcon = icon.GRID;
      this.listIcon = icon.List;
    } else {
      this.reportIcon = icon.REPORT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.rejectIcon = icon.DENY_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.gridIcon = icon.GRID_WHITE;
      this.listIcon = icon.List_LIGHT;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.reportIcon = icon.REPORT;
        this.approveIcon = icon.APPROVE;
        this.rejectIcon = icon.DENY;
        this.backIcon = icon.BACK;
        this.editIcon = icon.EDIT;
        this.viewIcon = icon.VIEW;
        this.gridIcon = icon.GRID;
        this.listIcon = icon.List;

      } else {
        this.mode = "on";
        this.reportIcon = icon.REPORT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.rejectIcon = icon.DENY_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.gridIcon = icon.GRID_WHITE;
        this.listIcon = icon.List_LIGHT;
      }
      if (j != 0) {
        setTimeout(() => {
          this.rerenderfunc();
        }, 100);
      }

      j++;
    });
    let i = 0;
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      that.Listing_Action_Edit = that.translate.instant('Listing_Action_Edit');
      that.inacticve_word = this.translate.instant("project_setting_inactive");
      that.invoice_no = that.translate.instant("invoice_no");
      that.po_no = that.translate.instant("po_no");
      that.packing_slip_no = that.translate.instant("packing_slip_no");
      that.Receiving_Slip = that.translate.instant("Receiving_Slip");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Receiving_Attachment = that.translate.instant("Receiving_Attachment");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.template_notes = that.translate.instant("template_notes");
      if (i != 0) {
        setTimeout(() => {
          this.rerenderfunc();
        }, 100);
      }
      i++;
    });

  }

  ngOnInit(): void {
    const that = this;
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language, });
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.dtOptions = {
      pagingType: "full_numbers",
      columnDefs: [
        {
          targets: [], //first column / numbering column
          orderable: false, //set not orderable
        },
        {
          targets: [0, 1],
          className: 'noVis'
        }
      ],

      // Declare the use of the extension in the dom parameter
      dom: 'Bfrtip',

      // Configure the buttons
      buttons: [
        // 'columnsToggle',
        // 'colvis',
        {
          extend: 'colvis',
          columns: ':not(.noVis)'

        },
        // 'copy',
        // 'print',
        // 'excel',
        {
          extend: 'excelHtml5',
          title: 'Invoice excel Report',

          titleAttr: 'Export Excel',
          exportOptions: {
            columns: ':visible'
          }

        },
        // {
        //   text: 'Some button',
        //   key: '1',
        //   action: function (e: any, dt: any, node: any, config: any) {
        //     alert('Button activated');
        //   }
        // }
      ],
    };

    this.getAllInvoices();
  }


  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  rerenderfunc() {
    this.showInvoiceTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;

    setTimeout(() => {
      that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.showInvoiceTable = true;
    }, 100);
  }

  getAllInvoices() {
    let that = this;
    let requestObject = {
      start_date: this.startDate,
      end_date: this.endDate,
    };
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_INVOICE_FOR_REPORT, requestObject).subscribe(function (params) {
      if (params.status) {
        that.allInvoices = params.data;
      }
      that.uiSpinner.spin$.next(false);
      that.showInvoiceTable = false;
      setTimeout(() => {
        that.showInvoiceTable = true;
      }, 100);
    });
  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    this.startDate = Math.round(new Date(dateRangeStart.value).getTime() / 1000);
    this.endDate = Math.round(new Date(dateRangeEnd.value).getTime() / 1000) + 86400;
    this.getAllInvoices();
  }
}
