import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonFileChangeEvent, commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer, gallery_options, MMDDYYYY, MMDDYYYY_formet } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../../map/mode-detect.service';

import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { Email } from '../../portal-auth/models';
import { MatChipInputEvent } from '@angular/material/chips';

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
  selector: 'app-invoice-other-document',
  templateUrl: './invoice-other-document.component.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class InvoiceOtherDocumentComponent implements OnInit {
  @Input() documentType: any;
  @Input() showPDF: any;

  hideToggle = false;
  disabled = false;
  displayMode: string = 'default';
  pdf_url = '';
  multi = false;
  hide: Boolean = true;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;

  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  invoiceData: any;
  loadInvoice: boolean = false;
  id: any;
  has_document: boolean = false;
  otherDocument: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;

  notesList: any = [];
  atchmentList: any = [];
  show_Nots: boolean = false;
  otherDocumentNoteform: FormGroup;
  invoice_id: any;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  filepath: any;
  last_files_array: any = [];
  files_old: any = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  datefrompicker = new Date();
  _id: string;
  LOCAL_OFFSET: number;
  role_permission: any;
  Remove_Attchment: any;
  saveAttachmentObj: any;
  loadingGIF: string = './assets/images/rovuk-gif.gif';

  constructor(private sanitiser: DomSanitizer, public translate: TranslateService, private formBuilder: FormBuilder, public snackbarservice: Snackbarservice, public httpCall: HttpCall, public uiSpinner: UiSpinnerService, public dialog: MatDialog, private router: Router, private modeService: ModeDetectService, public route: ActivatedRoute,) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;
    this._id = this.id;
    this.loadingGIF = this.httpCall.getLoader();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
      this.Remove_Attchment = this.translate.instant("Remove_Attchment");
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";

    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      }
    });
  }

  ngOnInit(): void {
    let that = this;
    let pdf_url;
    this.getOneInvoice();
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.otherDocumentNoteform = this.formBuilder.group({
      notes: [""],

    });

  }

  showHidePDF() {
    // this.showPDF = !this.showPDF;
  }
  goToEdit(invoice) {
    let that = this;
    if (that.documentType == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { _id: this.invoice_id } });
    } else if (that.documentType == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { _id: this.invoice_id } });
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { _id: this.invoice_id } });
    } else if (that.documentType == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { _id: this.invoice_id } });
    }
  }

  addNotes() {
    this.show_Nots = true;
  }

  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }

  requestFilesDialog() {
    const dialogRef = this.dialog.open(RequestFilesComponent, {
      height: '500px',
      width: '800px',
      data: this.documentType,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  saveNotes() {
    let document_Url;

    let that = this;
    this.otherDocumentNoteform.markAllAsTouched();
    if (that.otherDocumentNoteform.valid) {
      let req_temp = that.otherDocumentNoteform.value;
      req_temp.invoice_id = this.invoice_id;
      that.uiSpinner.spin$.next(true);
      if (that.documentType == that.documentTypes.po) {
        document_Url = httproutes.PORTAL_SAVE_P_O_NOTES;
      } else if (that.documentType == that.documentTypes.packingSlip) {
        document_Url = httproutes.PORTAL_SAVE_PACKING_SLIP_NOTES;
      } else if (that.documentType == that.documentTypes.receivingSlip) {
        document_Url = httproutes.PORTAL_SAVE_Receiving_Slip_NOTES;
      } else if (that.documentType == that.documentTypes.quote) {
        document_Url = httproutes.PORTAL_SAVE_Quote_NOTES;
      }


      that.httpCall.httpPostCall(document_Url, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.otherDocumentNoteform.reset();
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
    console.log
      ("call");
    let that = this;
    let document_Delet_Url;
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
          if (that.documentType == that.documentTypes.po) {
            document_Delet_Url = httproutes.PORTAL_DELETE_P_O_NOTES;
          } else if (that.documentType == that.documentTypes.packingSlip) {
            document_Delet_Url = httproutes.PORTAL_DELETE_PACKING_SLIP_NOTES;
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            document_Delet_Url = httproutes.PORTAL_DELETE_Receiving_Slip_NOTES;
          } else if (that.documentType == that.documentTypes.quote) {
            document_Delet_Url = httproutes.PORTAL_DELETE_Quote_NOTES;
          }
          that.httpCall.httpPostCall(document_Delet_Url, { _id: _id, invoice_id: invoice_id }).subscribe(function (params) {
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
  // invoice attchment
  saveAttchment() {
    let that = this;
    let attchment_Url;
    const formData = new FormData();
    for (var i = 0; i < that.files.length; i++) {
      formData.append("file[]", that.files[i]);
    }
    if (that.documentType == that.documentTypes.po) {
      formData.append("dir_name", wasabiImagePath.Po_attachments);
    } else if (that.documentType == that.documentTypes.packingSlip) {
      formData.append("dir_name", wasabiImagePath.Packing_slip_attachments);
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      formData.append("dir_name", wasabiImagePath.Reciving_slip_attachments);
    } else if (that.documentType == that.documentTypes.quote) {
      formData.append("dir_name", wasabiImagePath.Quote_attachments);
    }

    formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
    that.uiSpinner.spin$.next(true);
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
      .subscribe(function (params) {
        if (params.status) {
          if (that.documentType == that.documentTypes.po) {
            that.saveAttachmentObj = {
              _id: that._id,
              po_attachments: params.data.concat(that.last_files_array),
            };
          } else if (that.documentType == that.documentTypes.packingSlip) {
            that.saveAttachmentObj = {
              _id: that._id,
              packing_slip_attachments: params.data.concat(that.last_files_array),
            };
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            that.saveAttachmentObj = {
              _id: that._id,
              receiving_slip_attachments: params.data.concat(that.last_files_array),
            };
          } else if (that.documentType == that.documentTypes.quote) {
            that.saveAttachmentObj = {
              _id: that._id,
              quote_attachments: params.data.concat(that.last_files_array),
            };
          }
          if (that.documentType == that.documentTypes.po) {
            attchment_Url = httproutes.PORTAL_P_O_ATTCHMENTS;
          } else if (that.documentType == that.documentTypes.packingSlip) {
            attchment_Url = httproutes.PACKING_PACKING_SLIP_ATTCHMENTS;
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            attchment_Url = httproutes.PORTAL_Receiving_Slip_ATTCHMENTS;
          } else if (that.documentType == that.documentTypes.quote) {
            attchment_Url = httproutes.PORTAL_Quote_ATTCHMENTS;
          }
          that.httpCall.httpPostCall(attchment_Url, that.saveAttachmentObj).subscribe(function (params_new) {

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
          let attchment_Url;
          const formData = new FormData();
          for (var i = 0; i < that.files.length; i++) {
            formData.append("file[]", that.files[i]);
          }
          if (that.documentType == that.documentTypes.po) {
            formData.append("dir_name", wasabiImagePath.Po_attachments);
          } else if (that.documentType == that.documentTypes.packingSlip) {
            formData.append("dir_name", wasabiImagePath.Packing_slip_attachments);
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            formData.append("dir_name", wasabiImagePath.Reciving_slip_attachments);
          } else if (that.documentType == that.documentTypes.quote) {
            formData.append("dir_name", wasabiImagePath.Quote_attachments);
          }

          formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
          that.uiSpinner.spin$.next(true);
          that.httpCall
            .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
            .subscribe(function (params) {
              if (params.status) {
                if (that.documentType == that.documentTypes.po) {
                  that.saveAttachmentObj = {
                    _id: that._id,
                    po_attachments: params.data.concat(that.last_files_array),
                  };
                } else if (that.documentType == that.documentTypes.packingSlip) {
                  that.saveAttachmentObj = {
                    _id: that._id,
                    packing_slip_attachments: params.data.concat(that.last_files_array),
                  };
                } else if (that.documentType == that.documentTypes.receivingSlip) {
                  that.saveAttachmentObj = {
                    _id: that._id,
                    receiving_slip_attachments: params.data.concat(that.last_files_array),
                  };
                } else if (that.documentType == that.documentTypes.quote) {
                  that.saveAttachmentObj = {
                    _id: that._id,
                    quote_attachments: params.data.concat(that.last_files_array),
                  };
                }
                if (that.documentType == that.documentTypes.po) {
                  attchment_Url = httproutes.PORTAL_P_O_ATTCHMENTS;
                } else if (that.documentType == that.documentTypes.packingSlip) {
                  attchment_Url = httproutes.PACKING_PACKING_SLIP_ATTCHMENTS;
                } else if (that.documentType == that.documentTypes.receivingSlip) {
                  attchment_Url = httproutes.PORTAL_Receiving_Slip_ATTCHMENTS;
                } else if (that.documentType == that.documentTypes.quote) {
                  attchment_Url = httproutes.PORTAL_Quote_ATTCHMENTS;
                }
                that.httpCall.httpPostCall(attchment_Url, that.saveAttachmentObj).subscribe(function (params_new) {

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

  getOneInvoice() {
    let that = this;
    that.files_old = [];
    that.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id })
      .subscribe(function (params) {
        if (params.status) {
          that.invoiceData = params.data;
          if (that.documentType == that.documentTypes.po) {
            that.has_document = params.data.has_po;
            that.otherDocument = params.data.po_data;
            that.notesList = that.invoiceData.po_notes;
            for (let loop_i = 0; loop_i < params.data.po_attachments.length; loop_i++) {
              that.files_old.push(params.data.po_attachments[loop_i]);
            }
            that.last_files_array = that.invoiceData.po_attachments;
          } else if (that.documentType == that.documentTypes.packingSlip) {
            that.has_document = params.data.has_packing_slip;
            that.otherDocument = params.data.packing_slip_data;
            that.notesList = that.invoiceData.packing_slip_notes;
            that.atchmentList = that.invoiceData.packing_slip_notes;
            for (let loop_i = 0; loop_i < params.data.packing_slip_attachments.length; loop_i++) {
              that.files_old.push(params.data.packing_slip_attachments[loop_i]);
            }
            that.last_files_array = that.invoiceData.packing_slip_attachments;
          }
          else if (that.documentType == that.documentTypes.receivingSlip) {
            that.has_document = params.data.has_receiving_slip;
            that.otherDocument = params.data.receiving_slip_data;
            that.notesList = that.invoiceData.receiving_slip_notes;
            for (let loop_i = 0; loop_i < params.data.receiving_slip_attachments.length; loop_i++) {
              that.files_old.push(params.data.receiving_slip_attachments[loop_i]);
            }
            that.last_files_array = that.invoiceData.receiving_slip_attachments;
          }
          else if (that.documentType == that.documentTypes.quote) {
            that.has_document = params.data.has_quote;
            that.otherDocument = params.data.quote_data;
            that.notesList = that.invoiceData.quote_notes;
            for (let loop_i = 0; loop_i < params.data.quote_attachments.length; loop_i++) {
              that.files_old.push(params.data.quote_attachments[loop_i]);
            }
            that.last_files_array = that.invoiceData.quote_attachments;
          }
          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
  }
  print() {
    let that = this;
    let pdf_url;
    if (that.documentType == that.documentTypes.po) {
      pdf_url = this.invoiceData.po_data.pdf_url;
    } else if (that.documentType == that.documentTypes.packingSlip) {
      pdf_url = this.invoiceData.packing_slip_data.pdf_url;
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      pdf_url = this.invoiceData.receiving_slip_data.pdf_url;
    } else if (that.documentType == that.documentTypes.quote) {
      pdf_url = this.invoiceData.quote_data.pdf_url;
    }
    fetch(pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
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
  openAddDialog() {
    let that = this;
    const dialogRef = this.dialog.open(AddOtherFiles, {
      height: '400px',
      width: '700px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // that.getAllInvoices();
    });
  }
  openOrphanFilesDialog() {
    let that = this;
    const dialogRef = this.dialog.open(OrphanFiles, {
      height: "550px",
      width: "750px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      // that.employeeservice.getalluser().subscribe(function (data) {
      //   if (data.status) {
      //     that.usersArray = data.data;

      //   }
      // });
    });
  }


  download() {
    let that = this;
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    if (that.documentType == that.documentTypes.po) {
      a.href = this.invoiceData.po_data.pdf_url;
    } else if (that.documentType == that.documentTypes.packingSlip) {
      a.href = this.invoiceData.packing_slip_data.pdf_url;
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      a.href = this.invoiceData.receiving_slip_data.pdf_url;
    } else if (that.documentType == that.documentTypes.quote) {
      a.href = this.invoiceData.quote_data.pdf_url;
    }

    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
}

@Component({
  selector: 'add-other-files',
  templateUrl: './add-other-files.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class AddOtherFiles implements OnInit {
  @ViewChild('gallery')
  gallery!: NgxGalleryComponent;

  public form: any;
  selectedStatus: any;
  files_old: any = [];
  last_files_array: any = [];
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  _id!: string;
  fileIcon: string = "";
  FILE_NOT_SUPPORTED: string;
  Invoice_Add_Atleast_One_Document: string = '';

  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<AddOtherFiles>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService, public dialog: MatDialog, private sanitiser: DomSanitizer,
    public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService,
    private router: Router, public route: ActivatedRoute, public spinner: UiSpinnerService,) {

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT_WHITE;

      }


    });
    this.translate.stream([""]).subscribe((textarray) => {
      this.FILE_NOT_SUPPORTED = this.translate.instant("FILE_NOT_SUPPORTED");
      this.Invoice_Add_Atleast_One_Document = this.translate.instant('Invoice_Add_Atleast_One_Document');
    });

  }
  ngOnInit(): void {
    let tmp_gallery = gallery_options();
    this.galleryOptions = [
      tmp_gallery
    ];
  }


  files: File[] = [];


  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    commonFileChangeEvent(files, "pdf").then((result: any) => {
      if (result.status) {
        this.prepareFilesList(files.target.files);
      } else {
        this.snackbarservice.openSnackBar(this.FILE_NOT_SUPPORTED, "error");
      }
    });

  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    this.last_files_array.splice(index, 1);
    this.files_old.splice(index, 1);
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



  /*
    This method is used to display thumb image from local file.
    File/Image picker item is diplayed thmb based on file extensions.
  */
  thumbImage(file: any) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  /*
    This Method is used to display the Network Image.
    Find extension from url and display it from Wasabi. So this thumb is prepared from network only.
  */
  thumbNetworkImage(index: any) {
    return commonNetworkThumbImage(this.last_files_array[index]);
  }

  /*
    This method is used for download provision on click of the thumb initially implemented
    now improved as an open the Full size preview.
  */
  imageNetworkPreview(allAttachment: any, index: any) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0
    );
  }

  uploadDocuments() {
    let that = this;
    if (that.files.length == 0) {
      that.sb.openSnackBar(that.Invoice_Add_Atleast_One_Document, "error");
    } else {
      const formData = new FormData();
      for (var i = 0; i < that.files.length; i++) {
        formData.append("file[]", that.files[i]);
      }
      formData.append("dir_name", 'invoice');
      formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
        .subscribe(function (params) {
          if (params.status) {
            that.httpCall
              .httpPostCall(httproutes.INVOICE_SAVE_INVOICE_PROCESS, { pdf_urls: params.data })
              .subscribe(function (new_params) {
                if (new_params.status) {
                  that.sb.openSnackBar(new_params.message, "success");
                  that.uiSpinner.spin$.next(false);
                  that.dialogRef.close();
                } else {
                  that.sb.openSnackBar(new_params.message, "error");
                  that.uiSpinner.spin$.next(false);
                }
              });
          } else {
            that.sb.openSnackBar(params.message, "error");
            that.uiSpinner.spin$.next(false);
          }
        });
    }
  }
}


@Component({
  selector: 'orphan-files',
  templateUrl: './orphan-files.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class OrphanFiles implements OnInit {
  exitIcon: string;
  mode: any;
  subscription: Subscription;
  userList!: any[];
  orphanlist!: any[];
  showLoader: boolean = true;
  gifLoader: string = '';
  selectedUserList: any = [];
  newUserList: any = [];
  Import_Management_User_Missing_Role: string = '';
  UserLimitExceed: string = '';
  _id!: string;
  viewIcon: any;

  constructor(
    private modeService: ModeDetectService,
    private router: Router,
    public dialogRef: MatDialogRef<OrphanFiles>,
    public mostusedservice: Mostusedservice,
    public httpCall: HttpCall,
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
  ) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
      this.viewIcon = icon.VIEW;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
        this.viewIcon = icon.VIEW;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
      }
    });
    this._id = this.route.snapshot.queryParamMap.get("_id");
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    tmp_locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      this.Import_Management_User_Missing_Role = this.translate.instant('Import_Management_User_Missing_Role');
      this.UserLimitExceed = this.translate.instant('UserLimitExceed');
    });

    // this.userList = data?.reqData;
    // this.gifLoader = this.httpCall.getLoader();
  }

  ngOnInit(): void {


    this.getOrphanDocument();

  }

  goToDocument(document) {

    if (document.document_type == 'PACKING_SLIP') {
      this.router.navigate(['/packing-slip-form'], { queryParams: {} });
    }

  }

  getOrphanDocument() {

    let that = this;
    this.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_GET_ORPHAN_DOCUMENTS, { _id: this._id }).subscribe(params => {
      if (params.data) {
        that.orphanlist = params.data;

      }

    });
  }

}


@Component({
  selector: 'request-files',
  templateUrl: './request-files.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class RequestFilesComponent implements OnInit {

  public form: FormGroup;
  selectable = true;
  removable = true;
  addOnBlur = true;
  emailsList: any[] = [];
  vendorInfo: FormGroup;
  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  is_oneOnly: boolean = true;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  termList: any = [];
  saveIcon = icon.SAVE_WHITE;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  _id: any;

  /*Constructor*/
  constructor(
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<RequestFilesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sb: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
    private router: Router,
    public route: ActivatedRoute,
  ) {
    this.Report_File_Message = this.translate.instant("Report_File_Message");
    this.Report_File_Enter_Email = this.translate.instant(
      "Report_File_Enter_Email"
    );
    this.vendorInfo = this.formBuilder.group({

    });
    this._id = this.route.snapshot.queryParamMap.get('_id');

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  /*
ngOnInit
*/
  ngOnInit(): void {
    let that = this;

  }

  isValidMailFormat(value): any {
    var EMAIL_REGEXP =
      /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (value != "" && EMAIL_REGEXP.test(value)) {
      return { "Please provide a valid email": true };
    }
    return null;
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    // Add email
    if (value) {
      var validEmail = this.isValidMailFormat(value);
      if (validEmail) {
        this.emailsList.push(value);
        // Clear the input value
        event.chipInput!.clear();
      } else {
        // here error for valid email
      }
    }
  }

  internalEmailremove(email: Email): void {
    //----
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    //----
    const index = this.emailsList.indexOf(email);
    if (index >= 0) {
      this.emailsList.splice(index, 1);
      //----
      if (email == user_data.UserData.useremail) {
        this.is_oneOnly = true;
      }
      //----
    }
  }


  /*
   *
   * save button action
   */
  saveData() {
    let that = this;
    if (that.emailsList.length != 0) {
      that.uiSpinner.spin$.next(true);
      let requestObject = {
        email_list: that.emailsList,
        _id: that._id,
        module: that.data,
      };
      that.httpCall
        .httpPostCall(httproutes.INVOICE_REQUESR_FOR_INVOICE_FILES, requestObject)
        .subscribe(function (params: any) { });
      setTimeout(() => {
        that.uiSpinner.spin$.next(false);
        that.sb.openSnackBar(that.Report_File_Message, "success");
        that.dialogRef.close();
      }, 1000);
    } else {
      that.sb.openSnackBar(that.Report_File_Enter_Email, "error");
    }
  }

  /*
  Add my self button action
  */
  ADD_MY_SELF() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }
}
