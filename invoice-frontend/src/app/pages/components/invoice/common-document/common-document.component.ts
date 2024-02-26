import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { MMDDYYYY_formet, commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer } from 'src/app/service/utils';
import Swal from 'sweetalert2';
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
  selector: 'app-common-document',
  templateUrl: './common-document.component.html',
  styleUrls: ['./common-document.component.scss']
})
export class CommonDocumentComponent implements OnInit {
  @Input() data: any;
  @Input() module: any;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  hideToggle = false;
  hide: Boolean = true;
  disabled = false;
  multi = false;
  displayMode: string = 'default';
  role_permission: any;
  invoiceNoteform: FormGroup;
  notesList: any = [];
  show_Nots: boolean = false;
  last_files_array: any = [];

  files_old: any = [];
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  isSearch: boolean = false;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;
  id: any;
  LOCAL_OFFSET: number;

  editNoteAPIUrl: string = '';
  deleteNoteAPIUrl: string = '';

  saveNoteURL: string = '';
  deleteNoteURL: string = '';
  attchamentPath: string = '';
  saveAttchment_Url: string = '';
  documentTypes: any = {
    Invoice: 'Invoice',
    Po: 'PO',
    PackingSlip: 'Packing Slip',
    ReceivingSlip: 'Receiving Slip',
    Quote: 'Quote',
  };
  saveAttachmentObj: any;
  Remove_Attchment: any;

  constructor (public dialog: MatDialog, private formBuilder: FormBuilder, private sanitiser: DomSanitizer, public uiSpinner: UiSpinnerService, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public translate: TranslateService, public route: ActivatedRoute,) {
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
      this.Remove_Attchment = this.translate.instant("Remove_Attchment");


    });

    this.id = this.route.snapshot.queryParamMap.get('_id');

  }

  ngOnInit(): void {
    let that = this;
    that.notesList = that.data.invoice_notes;

    that.invoiceNoteform = this.formBuilder.group({
      notes: [""],

    });
    var tempAttachments = [];
    if (that.module == that.documentTypes.Invoice) {
      // Note
      that.notesList = that.data.invoice_notes;
      that.saveNoteURL = httproutes.PORTAL_SAVE_INVOICE_NOTES;
      that.deleteNoteURL = httproutes.PORTAL_DELETE_INVOICE_NOTES;
      // Attchment 
      that.attchamentPath = wasabiImagePath.INVOICE_ATTCHMENT;
      that.saveAttchment_Url = httproutes.PORTAL_INVOICE_ATTCHMENTS;
      tempAttachments = that.data.invoice_attachments;
    } else if (that.module == that.documentTypes.Po) {
      // Note
      that.notesList = that.data.po_notes;
      that.saveNoteURL = httproutes.PORTAL_SAVE_P_O_NOTES;
      that.deleteNoteURL = httproutes.PORTAL_DELETE_P_O_NOTES;
      // Attchment 
      that.attchamentPath = wasabiImagePath.Po_attachments;
      that.saveAttchment_Url = httproutes.PORTAL_P_O_ATTCHMENTS;
      tempAttachments = that.data.po_attachments;
    } else if (that.module == that.documentTypes.PackingSlip) {
      // Note
      that.notesList = that.data.packing_slip_notes;
      that.saveNoteURL = httproutes.PORTAL_SAVE_PACKING_SLIP_NOTES;
      that.deleteNoteURL = httproutes.PORTAL_DELETE_PACKING_SLIP_NOTES;
      // Attchment 
      that.attchamentPath = wasabiImagePath.Packing_slip_attachments;
      that.saveAttchment_Url = httproutes.PACKING_PACKING_SLIP_ATTCHMENTS;
      tempAttachments = that.data.packing_slip_attachments;
    } else if (that.module == that.documentTypes.ReceivingSlip) {
      // Note
      that.notesList = that.data.receiving_slip_notes;
      that.saveNoteURL = httproutes.PORTAL_SAVE_Receiving_Slip_NOTES;
      that.deleteNoteURL = httproutes.PORTAL_DELETE_Receiving_Slip_NOTES;
      // Attchment 
      that.attchamentPath = wasabiImagePath.Reciving_slip_attachments;
      that.saveAttchment_Url = httproutes.PORTAL_Receiving_Slip_ATTCHMENTS;
      tempAttachments = that.data.receiving_slip_attachments;
    } else if (that.module == that.documentTypes.Quote) {
      // Note
      that.notesList = that.data.quote_notes;
      that.saveNoteURL = httproutes.PORTAL_SAVE_Quote_NOTES;
      that.deleteNoteURL = httproutes.PORTAL_DELETE_Quote_NOTES;
      // Attchment 
      that.attchamentPath = wasabiImagePath.Quote_attachments;
      that.saveAttchment_Url = httproutes.PORTAL_Quote_ATTCHMENTS;
      tempAttachments = that.data.quote_attachments;
    }
    that.last_files_array = tempAttachments;
    that.files_old = [];
    for (let loop_i = 0; loop_i < tempAttachments.length; loop_i++) {
      that.files_old.push(tempAttachments[loop_i]);
    }
    that.last_files_array = tempAttachments;
  }
  saveNotes() {

    let that = this;
    this.invoiceNoteform.markAllAsTouched();
    if (that.invoiceNoteform.valid) {
      let req_temp = that.invoiceNoteform.value;
      req_temp.invoice_id = this.id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(that.saveNoteURL, req_temp).subscribe(function (params_new) {
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
  deleteNote(_id) {
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
          that.httpCall.httpPostCall(that.deleteNoteURL, { _id: _id, invoice_id: that.id }).subscribe(function (params) {
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
    var reqObject = null;
    const formData = new FormData();
    for (var i = 0; i < that.files.length; i++) {
      formData.append("file[]", that.files[i]);
    }
    formData.append("dir_name", that.attchamentPath);
    formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
    that.uiSpinner.spin$.next(true);
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
      .subscribe(function (params) {
        if (params.status) {
          if (that.module == that.documentTypes.Invoice) {
            that.saveAttachmentObj = {
              _id: "",
              invoice_attachments: params.data.concat(that.last_files_array)
            };
          } else if (that.module == that.documentTypes.Po) {
            that.saveAttachmentObj = {
              _id: "",
              po_attachments: params.data.concat(that.last_files_array)
            };
          } else if (that.module == that.documentTypes.PackingSlip) {
            that.saveAttachmentObj = {
              _id: "",
              packing_slip_attachments: params.data.concat(that.last_files_array)
            };
          } else if (that.module == that.documentTypes.ReceivingSlip) {
            that.saveAttachmentObj = {
              _id: "",
              receiving_slip_attachments: params.data.concat(that.last_files_array)
            };
          } else if (that.module == that.documentTypes.Quote) {
            that.saveAttachmentObj = {
              _id: "",
              quote_attachments: params.data.concat(that.last_files_array)
            };
          }
          that.saveAttachmentObj._id = that.id;
          that.httpCall.httpPostCall(that.saveAttchment_Url, that.saveAttachmentObj)
            .subscribe(function (params_new) {
              if (params_new.status) {
                that.snackbarservice.openSnackBar(params_new.message, "success");
                that.files = [];
                that.files_old = [];
                that.last_files_array = [];
                that.uiSpinner.spin$.next(false);
                that.getOneInvoice();
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

  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        var tempAttachments = [];
        if (that.module == that.documentTypes.Invoice) {
          that.notesList = params.data.invoice_notes;
          tempAttachments = params.data.invoice_attachments;
        } else if (that.module == that.documentTypes.Po) {
          that.notesList = params.data.po_notes;
          tempAttachments = params.data.po_attachments;
        } else if (that.module == that.documentTypes.PackingSlip) {
          that.notesList = params.data.packing_slip_notes;
          tempAttachments = params.data.packing_slip_attachments;
        } else if (that.module == that.documentTypes.ReceivingSlip) {
          that.notesList = params.data.receiving_slip_notes;
          tempAttachments = params.data.receiving_slip_attachments;
        } else if (that.module == that.documentTypes.Quote) {
          that.notesList = params.data.quote_notes;
          tempAttachments = params.data.quote_attachments;
        }

        that.last_files_array = tempAttachments;
        that.files_old = [];
        for (let loop_i = 0; loop_i < tempAttachments.length; loop_i++) {
          that.files_old.push(tempAttachments[loop_i]);
        }
        that.last_files_array = tempAttachments;

      }
      that.uiSpinner.spin$.next(false);
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
          const formData = new FormData();
          for (var i = 0; i < that.files.length; i++) {
            formData.append("file[]", that.files[i]);
          }
          formData.append("dir_name", that.attchamentPath);
          formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
          that.uiSpinner.spin$.next(true);
          that.httpCall
            .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
            .subscribe(function (params) {
              if (params.status) {
                if (that.module == that.documentTypes.Invoice) {
                  that.saveAttachmentObj = {
                    _id: "",
                    invoice_attachments: params.data.concat(that.last_files_array)
                  };
                } else if (that.module == that.documentTypes.Po) {
                  that.saveAttachmentObj = {
                    _id: "",
                    po_attachments: params.data.concat(that.last_files_array)
                  };
                } else if (that.module == that.documentTypes.PackingSlip) {
                  that.saveAttachmentObj = {
                    _id: "",
                    packing_slip_attachments: params.data.concat(that.last_files_array)
                  };
                } else if (that.module == that.documentTypes.ReceivingSlip) {
                  that.saveAttachmentObj = {
                    _id: "",
                    receiving_slip_attachments: params.data.concat(that.last_files_array)
                  };
                } else if (that.module == that.documentTypes.Quote) {
                  that.saveAttachmentObj = {
                    _id: "",
                    quote_attachments: params.data.concat(that.last_files_array)
                  };
                }
                that.saveAttachmentObj._id = that.id;

                that.httpCall.httpPostCall(that.saveAttchment_Url, that.saveAttachmentObj)
                  .subscribe(function (params_new) {
                    if (params_new.status) {
                      that.snackbarservice.openSnackBar(
                        params_new.message,
                        "success"
                      );
                      that.files = [];
                      that.files_old = [];
                      that.last_files_array = [];
                      that.uiSpinner.spin$.next(false);
                      that.getOneInvoice();
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




  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }
  addNotes() {
    this.show_Nots = true;
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

}
