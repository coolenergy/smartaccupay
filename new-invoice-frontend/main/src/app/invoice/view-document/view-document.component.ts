import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { TermModel } from 'src/app/settings/settings.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { amountChange, epochToDateTime, numberWithCommas, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { configData } from 'src/environments/configData';
import * as  moment from "moment";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-document',
  templateUrl: './view-document.component.html',
  styleUrls: ['./view-document.component.scss']
})
export class ViewDocumentComponent {
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  poForm: UntypedFormGroup;
  quoteForm: UntypedFormGroup;
  packingSlipForm: UntypedFormGroup;
  receivingSlipForm: UntypedFormGroup;
  showEditForm = false;

  pdf_url = '';
  invoicePDF = '';
  loadPDF = false;

  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  documentTypesList: any = configData.DOCUMENT_TYPE_LIST;

  document: any;
  selectedDocumentType = '';
  documentTypes = configData.DOCUMENT_TYPES;
  documentData: any;
  id: any;
  documentId: any;
  otherDocumentData: any;
  maxDate = new Date();
  invoice_id: any;
  pdfLoader = true;

  constructor (public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, private fb: UntypedFormBuilder,
    public commonService: CommonService, public route: ActivatedRoute, private router: Router, public translate: TranslateService,) {
    this.document = this.route.snapshot.queryParamMap.get('document') ?? '';
    this.selectedDocumentType = this.document;
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.documentId = this.route.snapshot.queryParamMap.get('document_id') ?? '';

    this.poForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      quote_no: ['',],
      date_epoch: [''],
      shipping_method: [''],
      sub_total: [''],
      tax: [''],
      quote_total: [''],
      receiver_phone: [''],
      terms: [''],
      address: [''],
    });

    this.quoteForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      quote_no: ['',],
      date_epoch: [''],
      shipping_method: [''],
      sub_total: [''],
      tax: [''],
      quote_total: [''],
      receiver_phone: [''],
      terms: [''],
      address: [''],
    });

    this.packingSlipForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      invoice: ['',],
      date_epoch: [''],
      po: [''],
      address: [''],
      received_by: [''],
    });

    this.receivingSlipForm = this.fb.group({
      document_type: ['', [Validators.required]],
      vendor_name: [''],
      invoice: ['',],
      date_epoch: [''],
      po: [''],
      address: [''],
      received_by: [''],
    });

    this.getTerms();
    if (this.id) {
      if (this.document == 'PURCHASE_ORDER') {
        this.getOnePo();
      } else if (this.document == 'QUOTE') {
        this.getOneQuote();
      } else if (this.document == 'PACKING_SLIP') {
        this.getOnePackingSlipList();
      } else if (this.document == 'RECEIVING_SLIP') {
        this.getOneRecevingSlipList();
      }
    } else if (this.documentId) {
      this.getOneOtherDocument();
    }
  }

  async getOneOtherDocument() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_OTHER_DOCUMENT, { _id: this.documentId });
    if (data.status) {
      this.otherDocumentData = data.data;
      this.setOtherDocumentForm();
    }
  }

  setOtherDocumentForm() {
    let date;
    if (this.otherDocumentData.date_epoch != undefined && this.otherDocumentData.date_epoch != null && this.otherDocumentData.date_epoch != 0) {
      date = epochToDateTime(this.otherDocumentData.date_epoch);
    }
    /*  let document_type = '';
     const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
     if (foundIndex != null) {
       document_type = this.documentTypesList[foundIndex].name;
     } */
    if (this.selectedDocumentType == this.documentTypes.po) {
      this.poForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.otherDocumentData.vendor_data?.vendor_name],
        quote_no: [''],
        date_epoch: [date],
        shipping_method: [''],
        sub_total: ['0.00'],
        tax: ['0.00'],
        po_total: ['0.00'],
        receiver_phone: [''],
        terms: [''],
        address: [''],
      });
    } else if (this.selectedDocumentType == this.documentTypes.quote) {
      this.quoteForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.otherDocumentData.vendor_data?.vendor_name],
        quote_no: [''],
        date_epoch: [date],
        shipping_method: [''],
        sub_total: ['0.00'],
        tax: ['0.00'],
        quote_total: ['0.00'],
        receiver_phone: [''],
        terms: [''],
        address: [''],
      });
    } else if (this.selectedDocumentType == this.documentTypes.packingSlip) {
      this.packingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.otherDocumentData.vendor_data?.vendor_name],
        invoice_no: [this.otherDocumentData.invoice_no],
        date_epoch: [date],
        po_no: [this.otherDocumentData.po_no],
        address: [''],
        received_by: [''],
      });
    } else if (this.selectedDocumentType == this.documentTypes.receivingSlip) {
      this.receivingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.otherDocumentData.vendor_data?.vendor_name],
        invoice_no: [this.otherDocumentData.invoice_no],
        date_epoch: [date],
        po_no: [this.otherDocumentData.po_no],
        address: [''],
        received_by: [''],
      });
    }
    this.pdf_url = this.otherDocumentData.pdf_url;
    this.showEditForm = true;
    this.loadPDF = false;
    setTimeout(() => {
      this.loadPDF = true;
    }, 100);
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.variablestermList = data.data;
      this.termsList = this.variablestermList.slice();
    }
  }

  goDocumentForm() {
    this.showEditForm = true;
  }

  async getOnePo() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_PO, { _id: this.id });
    if (data.status) {
      this.documentData = data.data;
      let poDate;
      if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
        poDate = epochToDateTime(this.documentData.date_epoch);
      }
      this.invoice_id = this.documentData.invoice_id;
      /* let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.documentData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      } */
      this.poForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        quote_no: [this.documentData.quote_no],
        date_epoch: [poDate],
        shipping_method: [this.documentData.shipping_method],
        sub_total: [numberWithCommas(this.documentData.sub_total.toFixed(2))],
        tax: [numberWithCommas(this.documentData.tax.toFixed(2))],
        po_total: [numberWithCommas(this.documentData.po_total.toFixed(2))],
        receiver_phone: [this.documentData.receiver_phone],
        terms: [this.documentData.terms],
        address: [this.documentData.address],
      });
      this.pdf_url = this.documentData.pdf_url;
      if (this.documentData.invoice) {
        this.invoicePDF = this.documentData.invoice.pdf_url;
      } else {
        this.showEditForm = true;
      }
      this.loadPDF = false;
      this.pdfLoader = true;
      setTimeout(() => {
        this.loadPDF = true;
        this.pdfLoader = false;
      }, 100);
    }
  }

  poAmountChange(params: any, controller: string) {
    this.poForm.get(controller)?.setValue(amountChange(params));
  }

  async savePO() {
    if (this.poForm.valid) {
      if (this.document === this.selectedDocumentType) {
        this.savePOData();
      } else {
        let oldType = '', newType = '';
        const foundOldIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
        if (foundOldIndex != null) {
          oldType = this.documentTypesList[foundOldIndex].name;
        }
        const foundNewIndex = this.documentTypesList.findIndex((x: any) => x.key === this.selectedDocumentType);
        if (foundNewIndex != null) {
          newType = this.documentTypesList[foundNewIndex].name;
        }
        swalWithBootstrapTwoButtons
          .fire({
            title: this.translate.instant('DOCUMENT.CHANGE_TYPE.CONFIRM_2').toString().replace(/#old/g, oldType).replace(/#new/g, newType),
            showDenyButton: true,
            confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
            denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
            allowOutsideClick: false,
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              this.savePOData();
            }
          });
      }
    }
  }

  async savePOData() {
    this.uiSpinner.spin$.next(true);
    const formValues = this.poForm.value;

    delete formValues.document_type;
    delete formValues.vendor_name;
    let apiUrl = '';
    formValues.document_type = this.documentTypes.po;
    if (this.id) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PO;
      if (this.document !== this.selectedDocumentType) {
        formValues.old_id = this.id;
        formValues.old_type = this.document;
        formValues.is_orphan = true;
      } else {
        formValues._id = this.id;
      }
    } else if (this.documentId) {
      formValues.pdf_url = this.otherDocumentData.pdf_url;
      formValues.document_id = this.documentId;
      formValues.vendor = this.otherDocumentData.vendor;
      formValues.invoice_no = this.otherDocumentData.invoice_no;
      formValues.po_no = this.otherDocumentData.po_no;
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_OTHER_DOCUMENT_PO;
    }

    if (formValues.date_epoch == null) {
      formValues.date_epoch = 0;
    } else {
      formValues.date_epoch = Math.round(formValues.date_epoch.valueOf() / 1000);
    }

    formValues.sub_total = formValues.sub_total.toString().replace(/,/g, "");
    formValues.tax = formValues.tax.toString().replace(/,/g, "");
    formValues.po_total = formValues.po_total.toString().replace(/,/g, "");

    const data = await this.commonService.postRequestAPI(apiUrl, formValues);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.back();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async getOneQuote() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_QUOTE, { _id: this.id });
    if (data.status) {
      this.documentData = data.data;
      let quoteDate;
      if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
        quoteDate = epochToDateTime(this.documentData.date_epoch);
      }
      /* let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.documentData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      } */
      this.invoice_id = this.documentData.invoice_id;
      this.quoteForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        quote_no: [this.documentData.quote_no],
        date_epoch: [quoteDate],
        shipping_method: [this.documentData.shipping_method],
        sub_total: [numberWithCommas(this.documentData.sub_total.toFixed(2))],
        tax: [numberWithCommas(this.documentData.tax.toFixed(2))],
        quote_total: [numberWithCommas(this.documentData.quote_total.toFixed(2))],
        receiver_phone: [this.documentData.receiver_phone],
        terms: [this.documentData.terms],
        address: [this.documentData.address],
      });
      this.pdf_url = this.documentData.pdf_url;
      if (this.documentData.invoice) {
        this.invoicePDF = this.documentData.invoice.pdf_url;
      } else {
        this.showEditForm = true;
      }
      this.loadPDF = false;
      this.pdfLoader = true;
      setTimeout(() => {
        this.loadPDF = true;
        this.pdfLoader = false;
      }, 100);
    }
  }

  quoteAmountChange(params: any, controller: string) {
    this.quoteForm.get(controller)?.setValue(amountChange(params));
  }

  async saveQuote() {
    if (this.quoteForm.valid) {
      if (this.document === this.selectedDocumentType) {
        this.saveQuoteData();
      } else {
        let oldType = '', newType = '';
        const foundOldIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
        if (foundOldIndex != null) {
          oldType = this.documentTypesList[foundOldIndex].name;
        }
        const foundNewIndex = this.documentTypesList.findIndex((x: any) => x.key === this.selectedDocumentType);
        if (foundNewIndex != null) {
          newType = this.documentTypesList[foundNewIndex].name;
        }
        swalWithBootstrapTwoButtons
          .fire({
            title: this.translate.instant('DOCUMENT.CHANGE_TYPE.CONFIRM_2').toString().replace(/#old/g, oldType).replace(/#new/g, newType),
            showDenyButton: true,
            confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
            denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
            allowOutsideClick: false,
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              this.saveQuoteData();
            }
          });
      }
    }
  }

  async saveQuoteData() {
    this.uiSpinner.spin$.next(true);
    const formValues = this.quoteForm.value;

    delete formValues.document_type;
    delete formValues.vendor_name;
    let apiUrl = '';
    formValues.document_type = this.documentTypes.quote;
    if (this.id) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_QUOTE;
      if (this.document !== this.selectedDocumentType) {
        formValues.old_id = this.id;
        formValues.old_type = this.document;
        formValues.is_orphan = true;
      } else {
        formValues._id = this.id;
      }
    } else if (this.documentId) {
      formValues.pdf_url = this.otherDocumentData.pdf_url;
      formValues.document_id = this.documentId;
      formValues.vendor = this.otherDocumentData.vendor;
      formValues.invoice_no = this.otherDocumentData.invoice_no;
      formValues.po_no = this.otherDocumentData.po_no;
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_OTHER_DOCUMENT_QUOTE;
    }

    if (formValues.date_epoch == null) {
      formValues.date_epoch = 0;
    } else {
      formValues.date_epoch = Math.round(formValues.date_epoch.valueOf() / 1000);
    }

    formValues.sub_total = formValues.sub_total.toString().replace(/,/g, "");
    formValues.tax = formValues.tax.toString().replace(/,/g, "");
    formValues.quote_total = formValues.quote_total.toString().replace(/,/g, "");

    const data = await this.commonService.postRequestAPI(apiUrl, formValues);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.back();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async getOnePackingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_PACKLING_SLIP, { _id: this.id });
    if (data.status) {
      this.documentData = data.data;
      let packingSlipDate;
      if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
        packingSlipDate = epochToDateTime(this.documentData.date_epoch);
      }
      /* let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.documentData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      } */
      this.invoice_id = this.documentData.invoice_id;
      this.packingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        invoice_no: [this.documentData.invoice_no],
        date_epoch: [packingSlipDate],
        po_no: [this.documentData.po_no],
        address: [this.documentData.address],
        received_by: [this.documentData.received_by],
      });
      this.pdf_url = this.documentData.pdf_url;
      if (this.documentData.invoice) {
        this.invoicePDF = this.documentData.invoice.pdf_url;
      } else {
        this.showEditForm = true;
      }
      this.loadPDF = false;
      this.pdfLoader = true;
      setTimeout(() => {
        this.loadPDF = true;
        this.pdfLoader = false;
      }, 100);
    }
  }

  async savePackingSlip() {
    if (this.packingSlipForm.valid) {
      if (this.document === this.selectedDocumentType) {
        this.savePackingSlipDate();
      } else {
        let oldType = '', newType = '';
        const foundOldIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
        if (foundOldIndex != null) {
          oldType = this.documentTypesList[foundOldIndex].name;
        }
        const foundNewIndex = this.documentTypesList.findIndex((x: any) => x.key === this.selectedDocumentType);
        if (foundNewIndex != null) {
          newType = this.documentTypesList[foundNewIndex].name;
        }
        swalWithBootstrapTwoButtons
          .fire({
            title: this.translate.instant('DOCUMENT.CHANGE_TYPE.CONFIRM_2').toString().replace(/#old/g, oldType).replace(/#new/g, newType),
            showDenyButton: true,
            confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
            denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
            allowOutsideClick: false,
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              this.savePackingSlipDate();
            }
          });
      }
    }
  }

  async savePackingSlipDate() {
    this.uiSpinner.spin$.next(true);
    const formValues = this.packingSlipForm.value;

    delete formValues.document_type;
    delete formValues.vendor_name;
    formValues.document_type = this.documentTypes.packingSlip;
    let apiUrl = '';
    if (this.id) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PACKLING_SLIP;
      if (this.document !== this.selectedDocumentType) {
        formValues.old_id = this.id;
        formValues.old_type = this.document;
        formValues.is_orphan = true;
      } else {
        formValues._id = this.id;
      }
    } else if (this.documentId) {
      formValues.pdf_url = this.otherDocumentData.pdf_url;
      formValues.document_id = this.documentId;
      formValues.vendor = this.otherDocumentData.vendor;
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_OTHER_DOCUMENT_PACKLING_SLIP;
    }

    if (formValues.date_epoch == null) {
      formValues.date_epoch = 0;
    } else {
      formValues.date_epoch = Math.round(formValues.date_epoch.valueOf() / 1000);
    }

    const data = await this.commonService.postRequestAPI(apiUrl, formValues);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.back();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async getOneRecevingSlipList() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_RECEVING_SLIP, { _id: this.id });
    if (data.status) {
      this.documentData = data.data;
      let receivingSliDate;
      if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
        receivingSliDate = epochToDateTime(this.documentData.date_epoch);
      }
      /* let document_type = '';
      const foundIndex = this.documentTypesList.findIndex((x: any) => x.key === this.documentData.document_type);
      if (foundIndex != null) {
        document_type = this.documentTypesList[foundIndex].name;
      } */
      this.invoice_id = this.documentData.invoice_id;
      this.receivingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        invoice_no: [this.documentData.invoice_no],
        date_epoch: [receivingSliDate],
        po_no: [this.documentData.po_no],
        address: [this.documentData.address],
        received_by: [this.documentData.received_by],
      });
      this.pdf_url = this.documentData.pdf_url;
      if (this.documentData.invoice) {
        this.invoicePDF = this.documentData.invoice.pdf_url;
      } else {
        this.showEditForm = true;
      }
      this.loadPDF = false;
      this.pdfLoader = true;
      setTimeout(() => {
        this.loadPDF = true;
        this.pdfLoader = false;
      }, 100);
    }
  }

  async saveReceivingSlip() {
    if (this.receivingSlipForm.valid) {
      if (this.document === this.selectedDocumentType) {
        this.saveReceivingSlipData();
      } else {
        let oldType = '', newType = '';
        const foundOldIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
        if (foundOldIndex != null) {
          oldType = this.documentTypesList[foundOldIndex].name;
        }
        const foundNewIndex = this.documentTypesList.findIndex((x: any) => x.key === this.selectedDocumentType);
        if (foundNewIndex != null) {
          newType = this.documentTypesList[foundNewIndex].name;
        }
        swalWithBootstrapTwoButtons
          .fire({
            title: this.translate.instant('DOCUMENT.CHANGE_TYPE.CONFIRM_2').toString().replace(/#old/g, oldType).replace(/#new/g, newType),
            showDenyButton: true,
            confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
            denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
            allowOutsideClick: false,
          })
          .then(async (result) => {
            if (result.isConfirmed) {
              this.saveReceivingSlipData();
            }
          });
      }
    }
  }

  async saveReceivingSlipData() {
    this.uiSpinner.spin$.next(true);
    const formValues = this.receivingSlipForm.value;

    delete formValues.document_type;
    delete formValues.vendor_name;
    formValues.document_type = this.documentTypes.receivingSlip;
    let apiUrl = '';
    if (this.id) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_RECEVING_SLIP;
      if (this.document !== this.selectedDocumentType) {
        formValues.old_id = this.id;
        formValues.old_type = this.document;
        formValues.is_orphan = true;
      } else {
        formValues._id = this.id;
      }
    } else if (this.documentId) {
      formValues.pdf_url = this.otherDocumentData.pdf_url;
      formValues.document_id = this.documentId;
      formValues.vendor = this.otherDocumentData.vendor;
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_OTHER_DOCUMENT_RECEVING_SLIP;
    }

    if (formValues.date_epoch == null) {
      formValues.date_epoch = 0;
    } else {
      formValues.date_epoch = Math.round(formValues.date_epoch.valueOf() / 1000);
    }

    const data = await this.commonService.postRequestAPI(apiUrl, formValues);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.back();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  backListing() {
    this.router.navigate([WEB_ROUTES.INVOICE]);
  }

  back() {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from) {
      if (from == 'dashboard') {
        this.router.navigate([WEB_ROUTES.DASHBOARD]);
      } else if (from == 'document') {
        let value;
        if (this.selectedDocumentType == 'PURCHASE_ORDER') {
          value = 0;
        } else if (this.selectedDocumentType == 'PACKING_SLIP') {
          value = 1;
        } else if (this.selectedDocumentType == 'RECEIVING_SLIP') {
          value = 2;
        } else if (this.selectedDocumentType == 'QUOTE') {
          value = 3;
        }
        this.router.navigate([WEB_ROUTES.DOCUMENTS], { state: { value: value } });
      } else {
        this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: this.invoice_id } });
      }
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: this.invoice_id } });
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
    const a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

  onKey(event: any) {

    if (event.target.value.length == 0) {

      // this.dashboardHistory = [];
      // this.start = 0;
      // this.getTodaysActivity();
    }
  }

  async removePDF() {
    this.uiSpinner.spin$.next(true);
    const requestObject = {
      _id: this.id,
      pdf_url: '',
    };
    let apiUrl = '';
    if (this.document == 'PURCHASE_ORDER') {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PO;
    } else if (this.document == 'QUOTE') {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_QUOTE;
    } else if (this.document == 'PACKING_SLIP') {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PACKLING_SLIP;
    } else if (this.document == 'RECEIVING_SLIP') {
      apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_RECEVING_SLIP;
    }
    const data = await this.commonService.postRequestAPI(apiUrl, requestObject);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      this.pdf_url = '';
      this.pdfLoader = true;
      setTimeout(() => {
        this.pdfLoader = false;
      }, 200);
    }
  }

  uploadDocument() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  fileBrowseHandler(files: any) {
    commonFileChangeEvent(files, "pdf").then(async (result: any) => {
      if (result.status) {
        this.uiSpinner.spin$.next(true);
        const formData = new FormData();
        formData.append("file[]", files.target.files[0]);
        formData.append("dir_name", 'invoice');
        formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
        const attachmentData = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_SAVE_ATTACHMENT, formData);
        if (attachmentData.status) {
          const requestObject = {
            pdf_url: attachmentData.data[0],
            _id: this.id,
          };
          let apiUrl = '';
          if (this.document == 'PURCHASE_ORDER') {
            apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PO;
          } else if (this.document == 'QUOTE') {
            apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_QUOTE;
          } else if (this.document == 'PACKING_SLIP') {
            apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_PACKLING_SLIP;
          } else if (this.document == 'RECEIVING_SLIP') {
            apiUrl = httpversion.PORTAL_V1 + httproutes.SAVE_AP_RECEVING_SLIP;
          }
          const data = await this.commonService.postRequestAPI(apiUrl, requestObject);
          this.uiSpinner.spin$.next(false);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            this.pdf_url = requestObject.pdf_url;
            this.pdfLoader = true;
            setTimeout(() => {
              this.pdfLoader = false;
            }, 200);
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        } else {
          this.uiSpinner.spin$.next(false);
          showNotification(this.snackBar, attachmentData.message, 'error');
        }
      } else {
        showNotification(this.snackBar, 'File type is not supported.', 'error');
      }
    });
  }

  onDocumentTypeChange(event: any) {
    let oldType = '', newType = '';
    const foundOldIndex = this.documentTypesList.findIndex((x: any) => x.key === this.document);
    if (foundOldIndex != null) {
      oldType = this.documentTypesList[foundOldIndex].name;
    }
    const foundNewIndex = this.documentTypesList.findIndex((x: any) => x.key === event.value);
    if (foundNewIndex != null) {
      newType = this.documentTypesList[foundNewIndex].name;
    }

    swalWithBootstrapTwoButtons
      .fire({
        title: this.translate.instant('DOCUMENT.CHANGE_TYPE.CONFIRM_1').toString().replace(/#old/g, oldType).replace(/#new/g, newType),
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          this.selectedDocumentType = event.value;
          if (this.id) {
            this.setDocumentForm();
          } else if (this.documentId) {
            this.setOtherDocumentForm();
          }
        } else {
          if (this.document == 'PURCHASE_ORDER') {
            this.poForm.get('document_type')?.setValue(this.document);
          } else if (this.document == 'QUOTE') {
            this.quoteForm.get('document_type')?.setValue(this.document);
          } else if (this.document == 'PACKING_SLIP') {
            this.packingSlipForm.get('document_type')?.setValue(this.document);
          } else if (this.document == 'RECEIVING_SLIP') {
            this.receivingSlipForm.get('document_type')?.setValue(this.document);
          }
        }
      });
  }

  setDocumentForm() {
    let date;
    if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
      date = epochToDateTime(this.documentData.date_epoch);
    }
    if (this.selectedDocumentType == 'PURCHASE_ORDER') {
      // this.poForm.get('document_type')?.setValue(this.document);
      this.poForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        quote_no: [this.documentData.quote_no],
        date_epoch: [date],
        shipping_method: [this.documentData.shipping_method],
        sub_total: [this.documentData.sub_total == null ? '0.00' : numberWithCommas(this.documentData.sub_total.toFixed(2))],
        tax: [this.documentData.tax == null ? '0.00' : numberWithCommas(this.documentData.tax.toFixed(2))],
        po_total: [this.documentData.po_total == null ? '0.00' : numberWithCommas(this.documentData.po_total.toFixed(2))],
        receiver_phone: [this.documentData.receiver_phone],
        terms: [this.documentData.terms],
        address: [this.documentData.address],
      });
    } else if (this.selectedDocumentType == 'QUOTE') {
      // this.quoteForm.get('document_type')?.setValue(this.document);
      this.quoteForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        quote_no: [this.documentData.quote_no],
        date_epoch: [date],
        shipping_method: [this.documentData.shipping_method],
        sub_total: [this.documentData.sub_total == null ? '0.00' : numberWithCommas(this.documentData.sub_total.toFixed(2))],
        tax: [this.documentData.tax == null ? '0.00' : numberWithCommas(this.documentData.tax.toFixed(2))],
        quote_total: [this.documentData.quote_total == null ? '0.00' : numberWithCommas(this.documentData.quote_total.toFixed(2))],
        receiver_phone: [this.documentData.receiver_phone],
        terms: [this.documentData.terms],
        address: [this.documentData.address],
      });
    } else if (this.selectedDocumentType == 'PACKING_SLIP') {
      // this.packingSlipForm.get('document_type')?.setValue(this.document);
      this.packingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        invoice_no: [this.documentData.invoice_no],
        date_epoch: [date],
        po_no: [this.documentData.po_no],
        address: [this.documentData.address],
        received_by: [this.documentData.received_by],
      });
    } else if (this.selectedDocumentType == 'RECEIVING_SLIP') {
      // this.receivingSlipForm.get('document_type')?.setValue(this.document);
      this.receivingSlipForm = this.fb.group({
        document_type: [this.selectedDocumentType],
        vendor_name: [this.documentData.vendor_data?.vendor_name],
        invoice_no: [this.documentData.invoice_no],
        date_epoch: [date],
        address: [this.documentData.address],
        received_by: [this.documentData.received_by],
      });
    }
  }
}
