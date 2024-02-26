
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';


import { MatDialog, } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonNewtworkAttachmentViewer, gallery_options, LanguageApp, MMDDYYYY_formet } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { InvoiceReport } from '../../invoice/invoice.component';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-dashboard-invoice-list',
  templateUrl: './dashboard-invoice-list.component.html',
  styleUrls: ['./dashboard-invoice-list.component.scss']
})
export class DashboardInvoiceListComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
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
  Vendor_VendorName: string;
  packing_slip_no: string;
  Receiving_Slip: string;
  Files_Attached: string;
  Uploaded_By: string;
  Uploaded_At: string;
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
  status: any;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  count: number = 0;
  allInvoices: any = [];
  vendorsList = [];

  constructor(private location: Location, private modeService: ModeDetectService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public route: ActivatedRoute,
    public translate: TranslateService) {

    let tmp_gridtolist_team = localStorage.getItem("gridtolist_invoice");
    this.gridtolist =
      tmp_gridtolist_team == "grid" || tmp_gridtolist_team == null
        ? true
        : false;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.status = this.route.snapshot.queryParamMap.get('status');
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
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      that.Listing_Action_Edit = that.translate.instant('Listing_Action_Edit');
    });
  }

  back() {
    this.router.navigate(['/dashboard']);
  }
  ngOnInit(): void {
    this.getAllVendors();
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
    this.translate.stream([""]).subscribe((textarray) => {
      that.acticve_word = this.translate.instant(
        "Team-EmployeeList-Status-Active"
      );
      that.inacticve_word = this.translate.instant("project_setting_inactive");
      that.invoice_no = that.translate.instant("invoice_no");
      that.po_no = that.translate.instant("po_no");
      that.Vendor_VendorName = that.translate.instant('Vendor_VendorName');
      that.Files_Attached = that.translate.instant('Files_Attached');
      that.Uploaded_By = that.translate.instant('Uploaded_By');
      that.Uploaded_At = that.translate.instant('Uploaded_At');
      that.packing_slip_no = that.translate.instant("packing_slip_no");
      that.Receiving_Slip = that.translate.instant("Receiving_Slip");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Receiving_Attachment = that.translate.instant("Receiving_Attachment");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.template_notes = that.translate.instant("template_notes");

      that.Vendor_Do_Want_Archive = that.translate.instant(
        "Vendor_Do_Want_Archive"
      );
      that.Compnay_Equipment_Delete_Yes = that.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      that.Compnay_Equipment_Delete_No = that.translate.instant(
        "Compnay_Equipment_Delete_No"
      );
      that.Purchasing_Orders_View = that.translate.instant(
        "Purchasing_Orders_View"
      );
      that.translate.get('Employee-List-list-to-grid').subscribe((text: string) => {
        that.listtogrid_text = text;
      });

      that.translate.get('Employee-List-grid-to-list').subscribe((text: string) => {
        that.gridtolist_text = text; that.btn_grid_list_text = text;
      });

      that.Listing_Action_Edit = that.translate.instant("Listing_Action_Edit");
      that.Archived_all = that.translate.instant(
        "Archived_all"
      );
      if (this.locallanguage === "en") {
        this.locallanguage = "es";
      } else {
        this.locallanguage = "en";
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      i++;
    });
    this.getAllInvoices();
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
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: false,
      language:
        portal_language == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );
        dataTablesParameters.status = that.status;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.INVOICE_GET_INVOICE_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
            that.count = resp.recordsTotal;
          });
      },
      columns: that.getColumName(),
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).off('click');
        $('td', row).on('click', () => {
          this.router.navigate(['/invoice-form'], { queryParams: { _id: data['_id'], status: that.status } });
        });
        return row;
      },
      drawCallback: () => {
        $(".button_attachment").on("click", (event) => {
          this.imageObject = JSON.parse(event.target.getAttribute("edit_tmp_id")).attachment;
          this.galleryImages = commonNewtworkAttachmentViewer(this.imageObject);
          setTimeout(() => {
            this.gallery.openPreview(0);
          }, 0);
        });
        $(".button_shiftEditClass").on("click", (event) => {
          let invoice1 = event.target.getAttribute("edit_tmp_id")?.replace(/\\/g, "'");
          let invoice = JSON.parse(invoice1 ?? '');
          this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id } });
        });
        $(".button_poReceivedViewClass").on("click", (event) => {
          let invoice = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });

        });

        $(".button_viewDocViewClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.pdf_url } });
        });
        $(".button_shiftApproveClass").on("click", (event) => {
          // Approve Invoice here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.updateInvoice({ _id: data._id, status: 'Approved' });
        });
        $(".button_shiftRejectClass").on("click", (event) => {
          // Approve Invoice here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.updateInvoice({ _id: data._id, status: 'Rejected' });
        });
      },
    };
  }

  getAllInvoices() {
    let that = this;
    let requestData = {};
    if (this.status != undefined && this.status != null && this.status != '') {
      requestData = {
        status: this.status,
      };
    }
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_STATUS_VISE_LIST, requestData).subscribe(function (params) {
      if (params.status) {
        that.allInvoices = params.data;
        that.count = params.count;
      }
      that.uiSpinner.spin$.next(false);
    });
  }
  getAllVendors() {
    let that = this;
    that.httpCall
      .httpGetCall(httproutes.INVOICE_VENDOR_GET)
      .subscribe(function (params) {
        if (params.status) {
          that.vendorsList = params.data;
        }
      });
  }
  invoiceReportDialog() {
    const dialogRef = this.dialog.open(InvoiceReport, {
      height: '500px',
      width: '800px',
      data: {
        vendorList: this.vendorsList,
        status: this.status,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  invoiceUpdateCard() {
    this.rerenderfunc();
    this.getAllInvoices();
  }
  updateInvoice(requestObject) {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        this.rerenderfunc();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);

      }
    });
  }
  gridTolist() {
    if (this.gridtolist) {
      this.btn_grid_list_text = this.listtogrid_text;
      localStorage.setItem('gridtolist_invoice', "list");
      this.gridtolist = false;
      this.rerenderfunc();
    } else {
      this.btn_grid_list_text = this.gridtolist_text;
      localStorage.setItem('gridtolist_invoice', "grid");
      this.gridtolist = true;
    }
  }

  getColumName() {
    let that = this;
    return [
      {
        title: that.invoice_no,
        data: "invoice",
        defaultContent: "",
      },
      {
        title: that.po_no,
        data: "p_o",
        defaultContent: "",
      },
      {
        title: that.Vendor_VendorName,
        data: "vendor.vendor_name",
        defaultContent: "",
      },
      {
        title: that.packing_slip_no,
        data: "packing_slip",
        defaultContent: "",
      },
      {
        title: that.Receiving_Slip,
        data: "receiving_slip",
        defaultContent: "",
      },
      {
        title: that.Files_Attached,
        data: 'attach_files',
        defaultContent: '',
      },
      {
        title: that.Uploaded_By,
        data: 'created_by',
        defaultContent: '',
      },
      {
        title: that.Uploaded_At,
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY_formet(full.created_at);
        },
        defaultContent: '',
      },
      {
        title: that.Vendor_Status,
        data: 'status',
        defaultContent: "",
        width: "7%",
      },

    ];
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  rerenderfunc() {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    that.showTable = false;
    setTimeout(() => {
      that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptions.columns = that.getColumName();
      that.showTable = true;
    }, 100);
  }
}
