import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer, epochToDateTime, gallery_options, MMDDYYYY_formet } from 'src/app/service/utils';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { InvoiceHistoryComponent, InvoiceRejectReason } from '../invoice-form/invoice-form.component';
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
  selector: 'app-invoice-detail-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode: string = 'default';
  placeholderIcon: icon.PHOTO_PLACEHOLDER;
  show_tabs: boolean = true;
  hideToggle = false;
  disabled = false;
  pdf_url = '';
  multi = false;
  hide: Boolean = true;
  backIcon: string;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  id: any;
  invoiceData: any;
  loadInvoice: boolean = false;
  has_packing_slip: any = [];
  notesList: any = [];
  invoiceNoteform: FormGroup;
  poDocumentType = 'PO';
  packingSlipDocumentType = 'Packing Slip';
  receivingSlipDocumentType = 'Receiving Slip';
  quoteoDocumentType = 'Quote';
  invoice_id: any;
  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  dashboardHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;
  show_Nots: boolean = false;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  filepath: any;
  last_files_array: any = [];
  files_old: any = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  datefrompicker = new Date();
  _id: string;
  LOCAL_OFFSET: number;
  historyIcon: string;
  role_permission: any;
  approveIcon: string;
  denyIcon: string;
  badge: any = [];
  status: any;
  invoiceform: FormGroup;
  Approve_Invoice_massage: string = "";
  Reject_Invoice_massage: string = "";
  document_id: any;
  vendor = new FormControl('');
  has_document: boolean = false;
  showPDF: boolean = true;
  selectedDocumentType: any = this.documentTypes.po;
  loadDocumentData: boolean = true;
  downIcon = icon.DOWN_WHITE;
  upIcon = icon.UP_WHITE;
  defalut_image = icon.MALE_PLACEHOLDER;
  Remove_Attchment: any;


  constructor (private sanitiser: DomSanitizer, private formBuilder: FormBuilder, public dialog: MatDialog, private location: Location, private modeService: ModeDetectService, private router: Router, public route: ActivatedRoute, public uiSpinner: UiSpinnerService, public httpCall: HttpCall,
    public snackbarservice: Snackbarservice, public translate: TranslateService,) {
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
      this.Approve_Invoice_massage = this.translate.instant("Approve_Invoice_massage");
      this.Reject_Invoice_massage = this.translate.instant("Reject_Invoice_massage");
      this.Remove_Attchment = this.translate.instant("Remove_Attchment");
    });

    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;
    this._id = this.id;
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.historyIcon = icon.HISTORY;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;


    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.historyIcon = icon.HISTORY_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.historyIcon = icon.HISTORY;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.historyIcon = icon.HISTORY_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
      }
    });
    if (this.id) {
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
    }

  }

  setNote(note) {
    return note;
  }

  ngOnInit(): void {
    this.getTodaysActivity();
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.invoiceNoteform = this.formBuilder.group({
      notes: [""],

    });
  }
  showHidePDF() {
    this.showPDF = !this.showPDF;
  }

  onTabChanged(event) {
    this.showPDF = true;
  }

  clickArrow() {
    this.showPDF = !this.showPDF;
  }

  setDocumentType(type) {
    this.selectedDocumentType = type;
    this.showPDF = true;
    this.loadDocumentData = false;
    setTimeout(() => {
      this.loadDocumentData = true;
    }, 100);
  }
  // invoice attchment
  saveAttchment() {
    let that = this;
    let reqObject = {
      // _id: this._id,
      _id: "",
      invoice_attachments: "",
    };
    const formData = new FormData();
    for (var i = 0; i < that.files.length; i++) {
      formData.append("file[]", that.files[i]);
    } formData.append("dir_name", wasabiImagePath.INVOICE_ATTCHMENT);
    formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
    that.uiSpinner.spin$.next(true);
    reqObject["local_offset"] = that.LOCAL_OFFSET;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
      .subscribe(function (params) {
        if (params.status) {

          reqObject._id = that._id;
          reqObject.invoice_attachments = params.data.concat(
            that.last_files_array
          );
          that.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_ATTCHMENTS, reqObject)
            .subscribe(function (params_new) {
              if (params_new.status) {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "success"
                );
                that.files = [];
                that.files_old = [];
                that.last_files_array = [];
                that.getOneInvoice();
                that.uiSpinner.spin$.next(false);
              } else {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "error"
                );
                that.uiSpinner.spin$.next(false);
              }
            });
        }


      });
  }



  files: File[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Remove_Attchment,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.yesButton,
        denyButtonText: this.noButton,

      })
      .then((result) => {
        if (result.isConfirmed) {
          this.last_files_array.splice(index, 1);
          this.files_old.splice(index, 1);
          let that = this;
          let reqObject = {
            // _id: this._id,
            _id: "",
            invoice_attachments: "",
          };
          const formData = new FormData();
          for (var i = 0; i < that.files.length; i++) {
            formData.append("file[]", that.files[i]);
          } formData.append("dir_name", wasabiImagePath.INVOICE_ATTCHMENT);
          formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
          that.uiSpinner.spin$.next(true);
          reqObject["local_offset"] = that.LOCAL_OFFSET;
          that.httpCall
            .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
            .subscribe(function (params) {
              if (params.status) {

                reqObject._id = that._id;
                reqObject.invoice_attachments = that.last_files_array;
                that.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_ATTCHMENTS, reqObject)
                  .subscribe(function (params_new) {
                    if (params_new.status) {
                      that.snackbarservice.openSnackBar(
                        params_new.message,
                        "success"
                      );
                      that.files = [];
                      that.files_old = [];
                      that.last_files_array = [];
                      that.getOneInvoice();
                      that.uiSpinner.spin$.next(false);
                    } else {
                      that.snackbarservice.openSnackBar(
                        params_new.message,
                        "error"
                      );
                      that.uiSpinner.spin$.next(false);
                    }
                  });
              }


            });
        }
      });
  }
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  thumbImage(file) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  thumbNetworkImage(index) {
    return commonNetworkThumbImage(this.last_files_array[index]);
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.files_old[index];
  }

  imageNetworkPreview(allAttachment, index) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }
  // End invoice attchment

  // invoice nots
  addNotes() {
    this.show_Nots = true;
  }
  getOneProcessDocument() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_GET, { _id: that.document_id }).subscribe(function (params) {
      if (params.status) {
        that.status = params.data.status;
        if (params.data.data) {

          that.invoiceData = params.data.data;
          if (that.invoiceData.pdf_url) {
            that.pdf_url = that.invoiceData.pdf_url;
          } else {
            that.pdf_url = params.data.pdf_url;
          }
          if (that.invoiceData.badge) {
            that.badge = that.invoiceData.badge;
          } else {
            that.badge = {
              document_type: false,
            };
          }
        } else {

          that.invoiceData = params.data;
          if (that.invoiceData.pdf_url) {
            that.pdf_url = that.invoiceData.pdf_url;
          } else {
            that.pdf_url = params.data.pdf_url;
          }
          that.badge = {
            document_type: false,
          };
        }
        let vendorId = '';
        if (that.invoiceData.vendor) {
          vendorId = that.invoiceData.vendor._id;
        }
        that.vendor.setValue(that.invoiceData.vendor);
        that.loadInvoice = true;
        var invoiceDate;
        if (that.invoiceData.invoice_date_epoch != 0) {
          invoiceDate = epochToDateTime(that.invoiceData.invoice_date_epoch);
        }
        var dueDate;
        if (that.invoiceData.due_date_epoch != 0) {
          dueDate = epochToDateTime(that.invoiceData.due_date_epoch);
        }
        var orderDate;
        if (that.invoiceData.order_date_epoch != 0) {
          orderDate = epochToDateTime(that.invoiceData.order_date_epoch);
        }
        var shipDate;
        if (that.invoiceData.ship_date_epoch != 0) {
          shipDate = epochToDateTime(that.invoiceData.ship_date_epoch);
        }
        that.invoiceform = that.formBuilder.group({
          document_type: [params.data.document_type],
          invoice_name: [that.invoiceData.invoice_name],
          vendor: [vendorId],
          vendor_id: [that.invoiceData.vendor_id],
          customer_id: [that.invoiceData.customer_id],
          invoice: [that.invoiceData.invoice],
          p_o: [that.invoiceData.p_o],
          job_number: [that.invoiceData.job_number],
          invoice_date_epoch: [invoiceDate],
          due_date_epoch: [dueDate],
          order_date_epoch: [orderDate],
          ship_date_epoch: [shipDate],
          packing_slip: [that.invoiceData.packing_slip],
          receiving_slip: [that.invoiceData.receiving_slip],
          status: [that.invoiceData.status ?? 'Pending'],
          terms: [that.invoiceData.terms],
          total: [that.invoiceData.total],
          tax_amount: [that.invoiceData.tax_amount],
          tax_id: [that.invoiceData.tax_id],
          sub_total: [that.invoiceData.sub_total],
          amount_due: [that.invoiceData.amount_due],
          cost_code: [that.invoiceData.cost_code],
          gl_account: [that.invoiceData.gl_account],
          assign_to: [that.invoiceData.assign_to],
          notes: [that.invoiceData.notes],
          pdf_url: [that.invoiceData.pdf_url],
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }

  updateInvoice(id, status) {
    let that = this;
    let title = '';
    if (status == 'Approved') {
      title = that.Approve_Invoice_massage;
    } else {
      title = that.Reject_Invoice_massage;
    }
    let requestObject = {
      _id: id,
      status: status,
    };
    swalWithBootstrapButtons
      .fire({
        title: title,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.yesButton,
        denyButtonText: that.noButton,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (status == 'Approved') {
            that.updateInvoiceStatus(requestObject);
          } else {
            const dialogRef = this.dialog.open(InvoiceRejectReason, {
              height: '350px',
              width: '600px',
              disableClose: true
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                if (result.status) {
                  var reqObject = {
                    _id: id,
                    status: status,
                    reject_reason: result.reject_reason,
                  };
                  that.updateInvoiceStatus(reqObject);
                }
              }
            });
          }
        }
      });
  }


  updateInvoiceStatus(requestObject) {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        if (that.id) {
          that.getOneInvoice();
        }
        if (that.document_id) {
          that.getOneProcessDocument();
        }
        that.status = requestObject.status;
        that.uiSpinner.spin$.next(false);
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  saveNotes() {

    let that = this;
    this.invoiceNoteform.markAllAsTouched();
    if (that.invoiceNoteform.valid) {
      let req_temp = that.invoiceNoteform.value;
      req_temp.invoice_id = this.invoice_id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_SAVE_INVOICE_NOTES, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.invoiceNoteform.reset();
          that.show_Nots = false;
          that.getOneInvoice();


        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }


  }
  deleteNote(_id, invoice_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Remove_Notes,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.yesButton,
        denyButtonText: this.noButton,

      })
      .then((result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          that.httpCall
            .httpPostCall(httproutes.PORTAL_DELETE_INVOICE_NOTES, {
              _id: _id,
              invoice_id: invoice_id
            })
            .subscribe(function (params) {
              that.uiSpinner.spin$.next(false);
              if (params.status) {

                that.snackbarservice.openSnackBar(params.message, "success");
                that.dialog.closeAll();
                that.getOneInvoice();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }

  getOneInvoice() {
    let that = this;
    that.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id })
      .subscribe(function (params) {
        if (params.status) {
          that.invoiceData = params.data;
          that.has_packing_slip = that.invoiceData.has_packing_slip;
          that.notesList = that.invoiceData.invoice_notes;
          that.files_old = [];
          for (let loop_i = 0; loop_i < params.data.invoice_attachments.length; loop_i++) {
            that.files_old.push(params.data.invoice_attachments[loop_i]);
          }
          that.last_files_array = that.invoiceData.invoice_attachments;

          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }


      });
  }

  goToInvoiceEdit(invoiceData) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoiceData._id } });

  }
  back(invoiceData) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoiceData._id } });
  }
  print() {
    fetch(this.invoiceData.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
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
    a.target = "_blank";
    a.href = this.invoiceData.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
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

  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }
  openHistoryDialog() {
    const dialogRef = this.dialog.open(InvoiceHistoryComponent, {
      height: "550px",
      width: "1000px",
      data: {
        // project_id: this.projectId,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }
  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;
    let requestObject = {};
    requestObject = {
      start: this.start,
      _id: this.id

    };
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_INVOICE_HISTORY, requestObject)
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            self.is_httpCall = false;
          self.dashboardHistory = self.dashboardHistory.concat(params.data);
        }

      });
  }


}





