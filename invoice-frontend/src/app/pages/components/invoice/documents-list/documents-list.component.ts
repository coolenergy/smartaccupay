import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { LanguageApp, MMDDYYYY } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { UiSpinnerService } from 'src/app/service/spinner.service';

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

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-documents-list',
  templateUrl: './documents-list.component.html',
  styleUrls: ['./documents-list.component.scss']
})
export class DocumentsListComponent implements OnInit {
  locallanguage: string;
  dtOptions: any = {};
  showTable: boolean = true;
  backIcon: string;
  viewIcon: string;
  editIcon: string;
  deleteIcon: string;
  step_index: number = 0;
  mode: any;
  documentTypes: any = {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
  };
  Archive_Orphan_Document_value: any = [];
  Archive_Orphan_Document: any;
  Uploaded_By: string;
  Uploaded_At: string;
  Archived_By: string;
  Archived_At: string;

  tab_Array: any = ['INVOICE', 'PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'QUOTE', 'Other', 'Delete'];

  constructor (public dialog: MatDialog, private http: HttpClient, private location: Location, public httpCall: HttpCall, private modeService: ModeDetectService,
    public snackbarservice: Snackbarservice, private router: Router, public translate: TranslateService,) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    let that = this;
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.backIcon = icon.BACK;
      this.viewIcon = icon.VIEW;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
    }
    let j = 0;
    this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.backIcon = icon.BACK;
        this.viewIcon = icon.VIEW;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
      } else {
        this.mode = "on";
        this.backIcon = icon.BACK_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      this.Uploaded_By = this.translate.instant('Uploaded_By');
      this.Uploaded_At = this.translate.instant('Uploaded_At');
      this.Archived_By = this.translate.instant('Archived_By');
      this.Archived_At = this.translate.instant('Archived_At');
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      i++;
    });
  }

  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    let that = this;
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language });
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: false,
      retrieve: true,
      language:
        portal_language == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );
        if (that.step_index == this.tab_Array.length - 1) {
          dataTablesParameters.is_delete = 1;
        } else {
          dataTablesParameters.is_delete = 0;
          dataTablesParameters.document_type = this.tab_Array[that.step_index];
        }
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_VIEW_DOCUMENTS_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,

            });
          });
      },
      columns: that.getColumName(),
      rowCallback: (row: Node, data: any[] | Object, index: number) => {
        $('td', row).off('click');
        $('td', row).on('click', () => {
          // this.router.navigate(['/invoice-detail'], { queryParams: { _id: data['_id'] } });
          this.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data['pdf_url'], document_id: data['_id'], document_type: data['document_type'], is_delete: data['is_delete'] } });
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
          if (data.document_type == '') {
            that.selectDocumentType(data._id);
          } else
            that.goToEdit(data);
        });
      },
    };
    this.rerenderfunc();
  }

  selectDocumentType(_id): void {
    const dialogRef = this.dialog.open(DocumentSelectDialog, {
      data: { _id: _id },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  goToEdit(document) {
    let that = this;
    if (document.document_type == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: document._id } });
    }
  }
  onTabChanged($event) {
    this.rerenderfunc();
  }

  getColumName() {
    let that = this;
    return [
      {
        title: 'Document Type',
        render: function (data: any, type: any, full: any) {
          if (full.document_type == '') {
            return 'No Identifying Information';
          }
          return full.document_type;
        },
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
        title: that.step_index == that.tab_Array.length - 1 ? that.Archived_By : that.Uploaded_By,
        data: "updated_by",

        defaultContent: "",
      },
      {
        title: that.step_index == that.tab_Array.length - 1 ? that.Archived_At : that.Uploaded_At,
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY(full.updated_at);
        },
        defaultContent: "",
      },

    ];
  }

  getSettings() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status) {
          that.Archive_Orphan_Document = params.data.settings.Archive_Orphan_Document.setting_status == 'Active';
          that.Archive_Orphan_Document_value = params.data.settings.Archive_Orphan_Document.setting_value;
        }
      });
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
            .httpPostCall(httproutes.PORTAL_DELETE_DOCUMENTS, { _id: _id })
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

  back() {
    this.location.back();
  }
}

@Component({
  selector: 'document-select-dialog',
  templateUrl: './document-select-dialog.html',
  styleUrls: ['./documents-list.component.scss']
})
export class DocumentSelectDialog {

  user_data: any = {};
  selectdocumenttype: FormGroup;
  @Input() documentType: any;
  DOCUMENT_TYPE: any = configdata.DOCUMENT_TYPE;
  http: any;
  LOCAL_OFFSET: number;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  add_my_self: string;
  saveIcon = icon.SAVE_WHITE;
  projectId: any = [];
  documentTypes: any = {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
    invoice: 'INVOICE'
  };


  constructor (private modeService: ModeDetectService, public dialogRef: MatDialogRef<DocumentSelectDialog>, public translate: TranslateService,
    private router: Router, @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder, public spinner: UiSpinnerService,
    public sb: Snackbarservice, public route: ActivatedRoute, public httpCall: HttpCall, public snackbarservice: Snackbarservice) {
    this.projectId = data.project_id;
    this.LOCAL_OFFSET = moment().utcOffset() * 60;
    let tmp_user = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.user_data = tmp_user.UserData;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
      this.add_my_self = icon.ADD_MY_SELF;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.add_my_self = icon.ADD_MY_SELF_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
        this.add_my_self = icon.ADD_MY_SELF;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
        this.add_my_self = icon.ADD_MY_SELF_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    let that = this;

    that.selectdocumenttype = that.formBuilder.group({
      select_form: [""],
    });

  };

  onDocumentSelectFormSelect(event) {
    this.dialogRef.close();
    let that = this;
    if (event == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: this.data._id, document_type: event, from: 'select' } });
    } else if (event == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: this.data._id, document_type: event, from: 'select' } });
    } else if (event == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: this.data._id, document_type: event, from: 'select' } });
    } else if (event == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: this.data._id, document_type: event, from: 'select' } });
    } else if (event == that.documentTypes.invoice) {
      that.router.navigate(['/invoice-form'], { queryParams: { document_id: this.data._id, document_type: event, from: 'select' } });
    }
  }
}