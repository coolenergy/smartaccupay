
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { gallery_options, LanguageApp, MMDDYYYY_formet } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
  pendingCount: number;
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
  selector: 'app-dashboard-files-list',
  templateUrl: './dashboard-files-list.component.html',
  styleUrls: ['./dashboard-files-list.component.scss']
})
export class DashboardFilesListComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  dtOptions: any = {};
  dtOptionsView: any = {};
  dtOptionsDuplicate: any = {};
  imageObject: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  termList = [];
  Document_View_time: boolean = false;
  Document_View_time_value = [];
  locallanguage: string;
  showTable: boolean = true;
  showViewTable: boolean = true;
  showDuplicateTable: boolean = true;
  invoice_no: string;
  po_no: string;
  packing_slip_no: string;
  Receiving_Slip: string;
  Receiving_Attachment: string;
  Vendor_Action: string;
  Vendor_Status: string;
  template_notes: string;

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
  backIcon: string;
  viewIcon: string;
  deleteIcon: string;
  counts: any = {
    pending_files: 0,
    pending_invoices: 0,
    approved_invoices: 0,
    rejected_invoices: 0,
    late_invoices: 0,
  };
  documentTypes: any = {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
    invoice: 'INVOICE'
  };

  constructor(private location: Location, private modeService: ModeDetectService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public translate: TranslateService) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.reportIcon = icon.REPORT;
      this.backIcon = icon.BACK;
      this.viewIcon = icon.VIEW;
      this.deleteIcon = icon.DELETE;
      this.editIcon = icon.EDIT;
    } else {
      this.reportIcon = icon.REPORT_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.reportIcon = icon.REPORT;
        this.backIcon = icon.BACK;
        this.viewIcon = icon.VIEW;
        this.deleteIcon = icon.DELETE;
        this.editIcon = icon.EDIT;
      } else {
        this.mode = "on";
        this.reportIcon = icon.REPORT_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
    let that = this;
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  back() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit(): void {
    const that = this;
    this.getSettings();
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
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_ORPHAN_DOCUMENTS_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
            that.counts.pending_files = resp.pendingCount;
          });
      },
      columns: that.getColumName(),
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).off('click');
        $('td', row).on('click', () => {
          // this.router.navigate(['/invoice-detail'], { queryParams: { _id: data['_id'] } });
          this.router.navigate(['/app-custompdfviewer'], {
            queryParams: {
              po_url: data['pdf_url'], document_id: data['_id'], document_type: data['document_type'], is_delete: data['is_delete'], counts: ['counts']
            }
          });
        });
        return row;
      },
      drawCallback: () => {
        $(".button_viewDocViewClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.pdf_url } });
        });
        $(".button_viewDocDeleteClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.deleteDocument(data._id);
        });
        $(".button_viewDocEditClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.goToEdit(data);
        });

      },
    };
    this.dtOptionsView = {
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
        dataTablesParameters.view_option = true;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_ORPHAN_DOCUMENTS_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
            that.counts.pending_files = resp.pendingCount;
          });
      },
      columns: that.getColumName(),
      drawCallback: () => {
        $(".button_viewDocViewClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.pdf_url } });
        });
        $(".button_viewDocDeleteClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.deleteDocument(data._id);
        });
      },
    };
    this.dtOptionsDuplicate = {
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
        dataTablesParameters.view_option = true;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_DUPLICATE_DOCUMENTS_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
            that.counts.pending_files = resp.pendingCount;
          });
      },
      columns: that.getDuplicateColumName(),
      drawCallback: () => {
        $(".button_viewDocViewClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.pdf_url } });
        });
        $(".button_viewDocDeleteClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.deleteDocument(data._id);
        });
      },
    };
    this.rerenderfunc();
  }

  getColumName() {
    let that = this;
    return [
      {
        title: 'Document Type',
        data: "document_type",
        defaultContent: "",
      },
      {
        title: 'PO NO',
        data: "po_no",
        defaultContent: "",
      },
      {
        title: 'Invoice No',
        data: "invoice_no",
        defaultContent: "",
      },
      {
        title: 'Vendor Name',
        data: "vendor_name",
        defaultContent: "",
      },
      {
        title: 'Uploaded By',
        data: "created_by_user",
        defaultContent: "",
      },
      {
        title: 'Uploaded At',
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY_formet(full.created_at);
        },
        defaultContent: "",
      },
      // {
      //   title: 'Action',
      //   render: function (data: any, type: any, full: any) {
      //     let tmp_tmp = {
      //       _id: full._id,
      //       document_id: full._id,
      //       pdf_url: full.pdf_url,
      //       document_type: full.document_type
      //     };
      //     let view = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocViewClass" >` + '<img src="' + that.viewIcon + `" alt="" height="15px">View</a>`;
      //     let archive = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocDeleteClass" >` + '<img src="' + that.deleteIcon + `" alt="" height="15px">Delete</a>`;
      //     let edit = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocEditClass" >` + '<img src="' + that.editIcon + `" alt="" height="15px">Edit</a>`;
      //     return (
      //       `
      //    <div class="dropdown">
      //      <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
      //      <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
      //        ` + view + `
      //        ` + edit + `
      //        ` + archive + `

      //      </div>
      //  </div>`
      //     );
      //   },
      //   width: "1%",
      //   orderable: false,
      // },
    ];
  }

  getDuplicateColumName() {
    let that = this;
    return [
      {
        title: 'Uploaded By',
        data: "created_by_user",
        defaultContent: "",
      },
      {
        title: 'Uploaded At',
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY_formet(full.created_at);
        },
        defaultContent: "",
      },
      {
        title: 'Action',
        render: function (data: any, type: any, full: any) {
          let tmp_tmp = {
            _id: full._id,
            document_id: full._id,
            pdf_url: full.pdf_url,
            document_type: full.document_type
          };
          let view = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocViewClass" >` + '<img src="' + that.viewIcon + `" alt="" height="15px">View</a>`;
          let archive = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocDeleteClass" >` + '<img src="' + that.deleteIcon + `" alt="" height="15px">Delete</a>`;
          return (
            `
         <div class="dropdown">
           <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
           <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
             ` + view + `
             ` + archive + `
           </div>
       </div>`
          );
        },
        width: "1%",
        orderable: false,
      },
    ];
  }

  goToEdit(document) {
    let that = this;
    if (document.document_type == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: document._id, documentTypes: document.document_type } });
    } else if (document.document_type == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: document._id, documentTypes: document.document_type } });
    } else if (document.document_type == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: document._id, documentTypes: document.document_type } });
    } else if (document.document_type == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: document._id, documentTypes: document.document_type } });
    } else if (document.document_type == that.documentTypes.invoice) {
      that.router.navigate(['/invoice-form'], { queryParams: { document_id: document._id, documentTypes: document.document_type } });
    }
  }

  deleteDocument(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure you want to delete this document?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.PORTAL_DELETE_DOCUMENTS, { _id: _id, is_delete: 1 })
            .subscribe(function (params) {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.rerenderfunc();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }
  getSettings() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status) {
          that.Document_View_time = params.data.settings.Document_View.setting_status == 'Active';
          that.Document_View_time_value = params.data.settings.Document_View.setting_value;
        }
      });
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }

  onTabChanged($event) {
    this.rerenderfunc();
  }

  rerenderfunc() {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    that.showTable = false;
    that.showViewTable = false;
    that.showDuplicateTable = false;
    setTimeout(() => {
      that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptions.columns = that.getColumName();

      that.dtOptionsView.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptionsView.columns = that.getColumName();

      that.dtOptionsDuplicate.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptionsDuplicate.columns = that.getDuplicateColumName();

      that.showTable = true;
      that.showViewTable = true;
      that.showDuplicateTable = true;
    }, 100);
  }
}

