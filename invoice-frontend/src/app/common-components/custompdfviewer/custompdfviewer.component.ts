import { Component, Inject, Input, OnInit } from '@angular/core';
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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentSelectDialog } from 'src/app/pages/components/invoice/documents-list/documents-list.component';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-custompdfviewer',
  templateUrl: './custompdfviewer.component.html',
  styleUrls: ['./custompdfviewer.component.scss']
})

export class CustompdfviewerComponent implements OnInit {
  @Input() data: any;
  pdf_url: any;
  isrefresh: boolean = false;
  isspoStatusapprovepending: boolean = false;
  isCertificateStatusPending: boolean = false;
  Custom_Pdf_Viewer_Please_Confirm: string = "";
  Custom_Pdf_Viewer_Want_Approve_Change_Order: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Custom_Pdf_Viewer_Want_Deny_Change_Order: string = "";
  approveIcon: string;
  denyIcon: string;
  backIcon: string;
  downloadIcon: string;
  printIcon: string;
  subscription: Subscription;
  mode: any;
  isDocumentEdit: boolean = false;
  isDocumentDelete: boolean = false;
  documentDeletValue: any;
  editIcon: any;
  deleteIcon: any;
  restoreIcon: any;
  Custom_Pdf_Viewer_Want_Approve_Owner_Direct_Purchase: string = '';
  Custom_Pdf_Viewer_Want_Deny_Owner_Direct_Purchase: string = '';
  Custom_Pdf_Viewer_Want_Accept_Vendor_Certificate: string = '';
  Custom_Pdf_Viewer_Want_Reject_Vendor_Certificate: string = '';
  documentTypes: any = {
    invoice: 'INVOICE',
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
  };
  Archive_Orphan_Document_value: any = [];
  Archive_Orphan_Document: any;
  role_permission: any;
  archivedIcon: any;


  constructor (private location: Location, private modeService: ModeDetectService, public route: ActivatedRoute, private router: Router,
    public httpCall: HttpCall, public spinner: UiSpinnerService, public snackbarservice: Snackbarservice,
    public translate: TranslateService, public dialog: MatDialog) {
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    this.translate.stream(['']).subscribe((textarray) => {
      this.Custom_Pdf_Viewer_Please_Confirm = this.translate.instant('Custom_Pdf_Viewer_Please_Confirm');
      this.Custom_Pdf_Viewer_Want_Approve_Change_Order = this.translate.instant('Custom_Pdf_Viewer_Want_Approve_Change_Order');
      this.Custom_Pdf_Viewer_Want_Deny_Change_Order = this.translate.instant('Custom_Pdf_Viewer_Want_Deny_Change_Order');
      this.Custom_Pdf_Viewer_Want_Approve_Owner_Direct_Purchase = this.translate.instant('Custom_Pdf_Viewer_Want_Approve_Owner_Direct_Purchase');
      this.Custom_Pdf_Viewer_Want_Deny_Owner_Direct_Purchase = this.translate.instant('Custom_Pdf_Viewer_Want_Deny_Owner_Direct_Purchase');

      this.Custom_Pdf_Viewer_Want_Accept_Vendor_Certificate = this.translate.instant('Custom_Pdf_Viewer_Want_Accept_Vendor_Certificate');
      this.Custom_Pdf_Viewer_Want_Reject_Vendor_Certificate = this.translate.instant('Custom_Pdf_Viewer_Want_Reject_Vendor_Certificate');

      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
    });

    this.pdf_url = this.route.snapshot.queryParamMap.get('po_url');
    if (this.route.snapshot.queryParamMap.get('project_id') != null && this.route.snapshot.queryParamMap.get('type') == "generate") {
      this.isrefresh = true;
    }

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.denyIcon = icon.DENY;
      this.approveIcon = icon.APPROVE;
      this.downloadIcon = icon.DOWNLOAD;
      this.backIcon = icon.BACK;
      this.printIcon = icon.PRINT;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
      this.restoreIcon = icon.RESTORE;
      this.archivedIcon = icon.ARCHIVE;

    } else {
      this.denyIcon = icon.DENY_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
      this.restoreIcon = icon.RESTORE_WHITE;
      this.archivedIcon = icon.ARCHIVE_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.denyIcon = icon.DENY;
        this.approveIcon = icon.APPROVE;
        this.downloadIcon = icon.DOWNLOAD;
        this.backIcon = icon.BACK;
        this.printIcon = icon.PRINT;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
        this.restoreIcon = icon.RESTORE;
        this.archivedIcon = icon.ARCHIVE;
      } else {
        this.mode = 'on';
        this.denyIcon = icon.DENY_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
        this.restoreIcon = icon.RESTORE_WHITE;
        this.archivedIcon = icon.ARCHIVE_WHITE;
      }
    });
  }

  back() {
    let project_id = this.route.snapshot.queryParamMap.get('project_id');
    let back_to = this.route.snapshot.queryParamMap.get('back_to');
    let type = this.route.snapshot.queryParamMap.get('type');
    let eq_id = this.route.snapshot.queryParamMap.get('eq_id');
    let co_id = this.route.snapshot.queryParamMap.get('change_order_id');
    let project_report_type = this.route.snapshot.queryParamMap.get('project_report_type');
    let safety_talk_id = this.route.snapshot.queryParamMap.get('safety_talk_id');
    let odp_id = this.route.snapshot.queryParamMap.get('odp_id');
    let certificate_id = this.route.snapshot.queryParamMap.get('certificate_id');
    let vendor_id = this.route.snapshot.queryParamMap.get('vendor_id');
    let counts = this.route.snapshot.queryParamMap.get('counts');
    let status = this.route.snapshot.queryParamMap.get('status');

    if (back_to == "incidentform") {
      let id = this.route.snapshot.queryParamMap.get('_id');
      this.router.navigate(['/project-report-incident-form'], { queryParams: { _id: id, project_id: project_id } });
    } else if (project_id != null && type == "generate") {
      this.location.back();
    } else if (project_id != null && eq_id != null) {
      let value: any = 5;
      this.router.navigate(['/project-details/' + project_id], { state: { value: value } });
    } else if (project_id != null && project_report_type == "generate") {
      let value: any = 2;
      this.router.navigate(['/project-details/' + project_id], { state: { value: value } });
    } else if (project_id != null && safety_talk_id != null) {
      let backto = this.route.snapshot.queryParamMap.get('backto');
      if (backto == "team") {
        let value: any = 5;
        let user_id = this.route.snapshot.queryParamMap.get("user_id");
        this.router.navigate(['/employee-view/' + user_id], { state: { value: value } });
      } else {
        let value: any = 9;
        this.router.navigate(['/project-details/' + project_id], { state: { value: value } });
      }
    } else if (project_id != null && co_id != null) {
      this.router.navigate(['/project-module'], { queryParams: { _id: project_id }, state: { value: 2 } });
    } else if (project_id != null && odp_id != null) {
      this.router.navigate(['/project-module'], { queryParams: { _id: project_id }, state: { value: 3 } });
    } else if (certificate_id != null && vendor_id != null) {
      this.router.navigate(['/editvendor-form'], { queryParams: { _id: vendor_id }, state: { value: 6 } });
    }
    else if (counts) {
      this.router.navigate(['/dashboard-files-list']);
    }
    else if (status) {
      this.router.navigate(['/documents-list']);
    } else {
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
    this.getSettings();
    let po_status = this.route.snapshot.queryParamMap.get('po_status');
    if (po_status == "Approve Pending" || po_status == "Approved by Prime") {
      this.isspoStatusapprovepending = true;
    }
    let certificate_status = this.route.snapshot.queryParamMap.get('certificate_status');
    if (certificate_status == "Pending") {
      this.isCertificateStatusPending = true;
    }
    let document_id = this.route.snapshot.queryParamMap.get('document_id');
    if (document_id) {
      this.isDocumentEdit = true;
    }

    let is_delete = this.route.snapshot.queryParamMap.get('is_delete');
    if (is_delete) {
      this.documentDeletValue = Number(is_delete);
      this.isDocumentDelete = true;
    }

    this.refresh();
  }

  goToDocumentEdit() {
    let that = this;
    let document_type = this.route.snapshot.queryParamMap.get('document_type');
    if (document_type == '' || document_type == 'UNKNOWN') {
      that.selectDocumentType();
    } else {
      that.goToEdit(document_type);
    }
  }

  selectDocumentType(): void {
    let that = this;
    let document_id = this.route.snapshot.queryParamMap.get('document_id');

    const dialogRef = this.dialog.open(DocumentSelectDialog, {
      data: {
        _id: document_id,

      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }
  goToEdit(document_type) {
    let that = this;
    let document_id = this.route.snapshot.queryParamMap.get('document_id');
    if (document_type == that.documentTypes.invoice) {
      that.router.navigate(['/invoice-form'], { queryParams: { document_id: document_id, document_type: document_type } });
    } else if (document_type == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: document_id, document_type: document_type } });
    } else if (document_type == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: document_id, document_type: document_type } });
    } else if (document_type == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: document_id, document_type: document_type } });
    } else if (document_type == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: document_id, document_type: document_type } });
    }
  }

  deleteDocument() {

    let that = this;

    let document_id = this.route.snapshot.queryParamMap.get('document_id');
    let counts = this.route.snapshot.queryParamMap.get('counts');
    swalWithBootstrapButtons
      .fire(
        {

          title: that.documentDeletValue == 0 ? ' Are you sure you want to archive this document? This document will be automatically remove from this list after ' + this.Archive_Orphan_Document_value + ' days.' : ' Are you sure you want to restore this document?',
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: 'Yes',
          denyButtonText: 'No',
        }).then((result) => {
          if (result.isConfirmed) {
            that.httpCall
              .httpPostCall(httproutes.PORTAL_DELETE_DOCUMENTS, { _id: document_id, is_delete: that.documentDeletValue == 0 ? 1 : 0 })
              .subscribe(function (params) {
                if (params.status) {
                  that.snackbarservice.openSnackBar(params.message, "success");
                  if (counts) {
                    that.router.navigate(['/dashboard-files-list'], { queryParams: { _id: document_id }, state: { value: that.documentDeletValue } });
                  } else {
                    that.router.navigate(['/documents-list'], { queryParams: { _id: document_id }, state: { value: that.documentDeletValue } });
                  }


                  //-state:
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
          that.Archive_Orphan_Document = params.data.settings.Archive_Orphan_Document.setting_status == 'Active';
          that.Archive_Orphan_Document_value = params.data.settings.Archive_Orphan_Document.setting_value;

        }
      });
  }
}

/*
  Send Certifiacte Form - Inside Rovuk A/P Panel
  To send certificate via email.
  This dialog is come inside the vendor detail screen
*/


@Component({
  selector: 'app-reject-vendor-certificate-reason',
  templateUrl: './reject-vendor-certificate-reason.html',
  styleUrls: ['./custompdfviewer.component.scss']
})

export class RejectVendorCertificateForm {

  public rejectForm: FormGroup;
  safetyTalkNameList: any;
  projectList: any;
  supervisorList: any;
  Report_File_Enter_Email: string = "";
  Report_File_Message: string = "";
  is_oneOnly: boolean = true;
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon = icon.SAVE_WHITE;
  constructor (public dialogRef: MatDialogRef<RejectVendorCertificateForm>, public httpCall: HttpCall, public uiSpinner: UiSpinnerService,
    public translate: TranslateService, @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: FormBuilder,
    private modeService: ModeDetectService, public snackbarservice: Snackbarservice, public route: ActivatedRoute,) {
    this.rejectForm = this.formBuilder.group({
      reject_reason: ['', Validators.required],
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }
    });
  }

  ngOnInit(): void {
  }


  async sendData() {
    let that = this;
    if (this.rejectForm.valid) {
      that.dialogRef.close({ reason: this.rejectForm.get('reject_reason')!.value });
    }
  }
}