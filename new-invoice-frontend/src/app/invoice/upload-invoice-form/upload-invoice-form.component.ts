import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SwitchCompanyComponent } from 'src/app/layout/header/switch-company/switch-company.component';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { commonLocalThumbImage, showNotification } from 'src/consts/utils';
import * as  moment from "moment";
import { commonFileChangeEvent } from 'src/app/services/utils';
import { DomSanitizer } from '@angular/platform-browser';
import { configData } from 'src/environments/configData';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-upload-invoice-form',
  templateUrl: './upload-invoice-form.component.html',
  styleUrls: ['./upload-invoice-form.component.scss']
})
export class UploadInvoiceFormComponent {
  files: File[] = [];
  supporting = false;
  documentList: any[] = [];
  selectedDocument = '';
  id: any;
  title = 'Upload Document';

  constructor (public dialogRef: MatDialogRef<SwitchCompanyComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private commonService: CommonService, private snackBar: MatSnackBar, public route: ActivatedRoute, public uiSpinner: UiSpinnerService,
    private formBuilder: FormBuilder, private sanitiser: DomSanitizer, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.supporting = data.supporting;
    for (let m = 0; m < configData.DOCUMENT_TYPE_LIST.length; m++) {
      if (configData.DOCUMENT_TYPE_LIST[m].key !== 'INVOICE') {
        this.documentList.push(configData.DOCUMENT_TYPE_LIST[m]);
      }
    }
  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  fileBrowseHandler(files: any) {
    commonFileChangeEvent(files, "pdf").then((result: any) => {
      if (result.status) {
        this.prepareFilesList(files.target.files);
      } else {
        showNotification(this.snackBar, 'File type is not supported.', 'error');
      }
    });
  }

  thumbImage(file: any) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  onChangeDocument(event: any) {
    this.selectedDocument = event.value;
    console.log("event ", event);
  }

  async uploadDocument() {
    if (this.files.length === 0) {
      showNotification(this.snackBar, 'Please select atleast one document.', 'error');
    } else {
      if (this.supporting && this.selectedDocument == '') {
        showNotification(this.snackBar, 'Please select document type.', 'error');
        return;
      }
      this.uiSpinner.spin$.next(true);
      const formData = new FormData();
      for (let i = 0; i < this.files.length; i++) {
        formData.append("file[]", this.files[i]);
      }
      formData.append("dir_name", 'invoice');
      formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));

      let pdfUrls = [];
      const attachmentData = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, formData);
      if (attachmentData.status) {
        pdfUrls = attachmentData.data;
      }
      let apiUrl = '';
      let requestObject;
      if (this.supporting) {
        requestObject = {
          invoice_id: this.id,
          pdf_url: pdfUrls[0],
          document_type: this.selectedDocument,
          vendor: this.data.vendor
        };
        if (this.selectedDocument == configData.DOCUMENT_TYPES.po) {
          apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PO;
        } else if (this.selectedDocument == configData.DOCUMENT_TYPES.quote) {
          apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_QUOTE;
        } else if (this.selectedDocument == configData.DOCUMENT_TYPES.packingSlip) {
          apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PACKLING_SLIP;
        } else if (this.selectedDocument == configData.DOCUMENT_TYPES.receivingSlip) {
          apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_RECEVING_SLIP;
        }
      } else {
        apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_DOCUMENT_PROCESS;
        requestObject = { pdf_urls: pdfUrls };
      }
      if (apiUrl == '') {
        return;
      }
      this.commonService.postRequestAPI(apiUrl, requestObject);
      this.uiSpinner.spin$.next(false);
      this.dialogRef.close({ status: true });
      showNotification(this.snackBar, this.translate.instant('INVOICE.UPLOAD.WAIT_FOR_RESPONSE'), 'success');
      /* if (data.status) {
        this.dialogRef.close({ status: true });
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      } */
    }
  }
}
