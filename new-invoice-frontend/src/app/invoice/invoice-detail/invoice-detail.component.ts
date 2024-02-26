import { ActivatedRoute, Router } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { WEB_ROUTES } from 'src/consts/routes';
import { SendInvoiceMessageComponent } from './send-invoice-message/send-invoice-message.component';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { icon } from 'src/consts/icon';
import { MailFormComponent } from '../mail-form/mail-form.component';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UserModel } from 'src/app/users/user.model';
import { VendorModel } from 'src/app/vendors/vendor.model';
import { configData } from 'src/environments/configData';
import { ClassNameModel, CostCodeModel, TermModel } from 'src/app/settings/settings.model';
import { ClientJobModel } from 'src/app/client/client.model';
import { amountChange, epochToDateTime, numberWithCommas, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceRejectedReasonComponent } from './invoice-rejected-reason/invoice-rejected-reason.component';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { Observable, map, startWith } from 'rxjs';
import { RolePermission } from 'src/consts/common.model';
import { commonFileChangeEvent } from 'src/app/services/utils';
import * as  moment from "moment";
import { UploadInvoiceFormComponent } from '../upload-invoice-form/upload-invoice-form.component';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.scss'],
})
export class InvoiceDetailComponent extends UnsubscribeOnDestroyAdapter {
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;

  MAIL_ICON = icon.MAIL_ICON;
  MESSAGE_ICON = icon.MESSAGE_ICON;
  panelOpenState = false;
  invoiceForm: UntypedFormGroup;
  moreInformationForm!: UntypedFormGroup;
  noteForm!: UntypedFormGroup;
  step = 0;
  pdf_url = '';
  loadInvoice = true;
  isLoading = true;
  maxDate = new Date();

  variablesVendorList: Array<VendorModel> = [];
  vendorList: Array<VendorModel> = this.variablesVendorList.slice();

  variablesUserList: Array<UserModel> = [];
  userList: Array<UserModel> = this.variablesUserList.slice();

  variablesJobNameList: Array<ClientJobModel> = [];
  jobNameList: Array<ClientJobModel> = this.variablesJobNameList.slice();

  variablesTermList: Array<TermModel> = [];
  termList: Array<TermModel> = this.variablesTermList.slice();

  variablesCostCodeList: Array<CostCodeModel> = [];
  costCodeList: Array<CostCodeModel> = this.variablesCostCodeList.slice();

  variablesClassNameList: Array<ClassNameModel> = [];
  classNameList: Array<ClassNameModel> = this.variablesClassNameList.slice();

  documentList: any = configData.DOCUMENT_TYPE_LIST;
  statusList: any = configData.INVOICE_STATUS;

  role_permission!: RolePermission;
  id: any;
  documentId: any;
  invoiceData: any;
  documentData: any;
  pdfLoader = true;
  notes: any = [];
  supportingDocuments: any = [];
  invoiceMessages: any = [];
  accountInfo: any = [];
  rejectReason = '';

  invoiceInfo: any = [];
  loadInvoiceInfo = true;
  showInfoForm = false;
  allowEditInfo = false;
  infoId: any;
  infoEditIndex = -1;
  infoAmount = '0.00';
  infoNotes = '';

  filteredUsers?: Observable<UserModel[]>;
  userControl = new UntypedFormControl();
  displayUserFn(user: UserModel): string {
    return user && user.userfullname ? user.userfullname : '';
  }

  filteredCostCode?: Observable<CostCodeModel[]>;
  costCodeControl = new UntypedFormControl();
  displayCostCodeFn(costcode: CostCodeModel): string {
    return costcode && costcode.cost_code ? costcode.cost_code : '';
  }

  filteredClient?: Observable<ClientJobModel[]>;
  clientControl = new UntypedFormControl();
  displayClientFn(client: ClientJobModel): string {
    return client && client.client_name ? client.client_name : '';
  }

  filteredClassName?: Observable<ClassNameModel[]>;
  classNameControl = new UntypedFormControl();
  displayClassNameFn(className: ClassNameModel): string {
    return className && className.name ? className.name : '';
  }

  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }
  constructor (private fb: UntypedFormBuilder, private router: Router, public dialog: MatDialog, private commonService: CommonService,
    public route: ActivatedRoute, public uiSpinner: UiSpinnerService, private snackBar: MatSnackBar, public translate: TranslateService,) {
    super();
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.documentId = this.route.snapshot.queryParamMap.get('document_id');

    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
    this.uiSpinner.spin$.next(true);
    this.invoiceForm = this.fb.group({
      document: [''],
      document_type: [''],
      vendor: [''],
      invoice_no: [''],
      invoice_date_epoch: [''],
      due_date_epoch: [''],
      invoice_total_amount: [''],
      tax_amount: [''],
      assign_to: [''],
      status: [''],
    });

    this.moreInformationForm = this.fb.group({
      vendor_id: [''],
      customer_id: [''],
      po_no: [''],

      job_client_name: [''],
      order_date_epoch: [''],
      ship_date_epoch: [''],

      packing_slip_no: [''],
      receiving_slip_no: [''],
      terms: [''],

      tax_id: [''],
      sub_total: [''],
      amount_due: [''],

      gl_account: [''],
      class_name: [''],

      notes: [''],
    });

    this.noteForm = this.fb.group({
      notes: ['', [Validators.required]],
    });

    this.getVendor();
    this.getUser();
    this.getClienJobName();
    this.getTerms();
    this.getCostCode();
    this.getClassName();

    if (this.id) {
      this.getOneInvoice();
    } else if (this.documentId) {
      this.getOneOtherDocument();
    }
    this.filteredUsers = this.userControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.userfullname)),
      map((userfullname) => (userfullname ? this._userFilter(userfullname) : this.userList.slice()))
    );

    this.filteredCostCode = this.costCodeControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.cost_code)),
      map((cost_code) => (cost_code ? this._costCodeFilter(cost_code) : this.costCodeList.slice()))
    );

    this.filteredClient = this.clientControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.client_name)),
      map((client_name) => (client_name ? this._clientFilter(client_name) : this.jobNameList.slice()))
    );

    this.filteredClassName = this.classNameControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this._classNameFilter(name) : this.classNameList.slice()))
    );

  }

  private _userFilter(userfullname: string): UserModel[] {
    const filterValue = userfullname.toLowerCase();
    return this.userList.filter(
      (option) => option.userfullname.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private _costCodeFilter(costCode: string): CostCodeModel[] {
    const filterValue = costCode.toLowerCase();
    return this.costCodeList.filter(
      (option) => option.cost_code.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private _clientFilter(client: string): ClientJobModel[] {
    const filterValue = client.toLowerCase();
    return this.jobNameList.filter(
      (option) => option.client_name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private _classNameFilter(className: string): ClassNameModel[] {
    const filterValue = className.toLowerCase();
    return this.classNameList.filter(
      (option) => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  async getVendor() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_VENDOR_GET, { is_delete: 0 });
    if (data.status) {
      this.variablesVendorList = data.data;
      this.vendorList = this.variablesVendorList.slice();
    }
  }

  async getUser() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER);
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();
    }
  }

  async getClienJobName() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLIENT);
    if (data.status) {
      this.variablesJobNameList = data.data;
      this.jobNameList = this.variablesJobNameList.slice();
    }
  }

  async getTerms() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_GET);
    if (data.status) {
      this.variablesTermList = data.data;
      this.termList = this.variablesTermList.slice();
    }
  }

  async getCostCode() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COST_CODE);
    if (data.status) {
      this.variablesCostCodeList = data.data;
      this.costCodeList = this.variablesCostCodeList.slice();
    }
  }

  async getClassName() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_CLASS_NAME);
    if (data.status) {
      this.variablesClassNameList = data.data;
      this.classNameList = this.variablesClassNameList.slice();
    }
  }

  goToDashboard() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }

  async getOneInvoice() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_INVOICE, { _id: this.id });
    if (data.status) {
      this.invoiceData = data.data;
      let invoiceDate;
      if (this.invoiceData.invoice_date_epoch != undefined && this.invoiceData.invoice_date_epoch != null && this.invoiceData.invoice_date_epoch != 0) {
        invoiceDate = epochToDateTime(this.invoiceData.invoice_date_epoch);
      }
      let dueDate;
      if (this.invoiceData.due_date_epoch != undefined && this.invoiceData.due_date_epoch != null && this.invoiceData.due_date_epoch != 0) {
        dueDate = epochToDateTime(this.invoiceData.due_date_epoch);
      }
      let document_type = '';
      console.log("this.documentList: ", this.documentList);
      const foundIndex = this.documentList.findIndex((x: any) => x.key === this.invoiceData.document_type);
      console.log("foundIndex", foundIndex);
      if (foundIndex != null && foundIndex != -1) {
        document_type = this.documentList[foundIndex].name;
      }

      this.invoiceForm = this.fb.group({
        document: [document_type],
        document_type: [this.invoiceData.document_type],
        vendor: [this.invoiceData.vendor],
        invoice_no: [this.invoiceData.invoice_no],
        invoice_date_epoch: [invoiceDate],
        due_date_epoch: [dueDate],
        invoice_total_amount: [numberWithCommas(Number(this.invoiceData.invoice_total_amount).toFixed(2))],
        tax_amount: [numberWithCommas(Number(this.invoiceData.tax_amount).toFixed(2))],
        assign_to: [this.invoiceData.assign_to],
        status: [this.invoiceData.status],
      });


      let orderDate;
      if (this.invoiceData.order_date_epoch != undefined && this.invoiceData.order_date_epoch != null && this.invoiceData.order_date_epoch != 0) {
        orderDate = epochToDateTime(this.invoiceData.order_date_epoch);
      }
      let shipDate;
      if (this.invoiceData.ship_date_epoch != undefined && this.invoiceData.ship_date_epoch != null && this.invoiceData.ship_date_epoch != 0) {
        shipDate = epochToDateTime(this.invoiceData.ship_date_epoch);
      }
      this.moreInformationForm = this.fb.group({
        vendor_id: [this.invoiceData.vendor_id],
        customer_id: [this.invoiceData.customer_id],
        po_no: [this.invoiceData.po_no],

        job_client_name: [this.invoiceData.job_client_name],
        order_date_epoch: [orderDate],
        ship_date_epoch: [shipDate],

        packing_slip_no: [this.invoiceData.packing_slip_no],
        receiving_slip_no: [this.invoiceData.receiving_slip_no],
        terms: [this.invoiceData.terms],

        tax_id: [this.invoiceData.tax_id],
        sub_total: [numberWithCommas(Number(this.invoiceData.sub_total).toFixed(2))],
        amount_due: [numberWithCommas(Number(this.invoiceData.amount_due).toFixed(2))],

        gl_account: [this.invoiceData.gl_account],
        class_name: [this.invoiceData.class_name],

        notes: [this.invoiceData.notes],
      });
      this.rejectReason = this.invoiceData.reject_reason;
      this.notes = this.invoiceData.invoice_notes;
      this.supportingDocuments = this.invoiceData.supporting_documents;
      this.invoiceInfo = this.invoiceData.invoice_info;
      this.invoiceMessages = this.invoiceData.invoice_messages;
      this.accountInfo = this.invoiceData.accounting_info;
      this.pdf_url = this.invoiceData.pdf_url;
      this.pdfLoader = false;
      this.uiSpinner.spin$.next(false);
    }
  }

  async getOneOtherDocument() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ONE_AP_OTHER_DOCUMENT, { _id: this.documentId });
    if (data.status) {
      this.documentData = data.data;
      let invoiceDate;
      if (this.documentData.date_epoch != undefined && this.documentData.date_epoch != null && this.documentData.date_epoch != 0) {
        invoiceDate = epochToDateTime(this.documentData.date_epoch);
      }
      this.invoiceForm = this.fb.group({
        document_type: [configData.DOCUMENT_TYPES.invoice],
        vendor: [this.documentData.vendor],
        invoice_no: [this.documentData.invoice_no],
        invoice_date_epoch: [invoiceDate],
        due_date_epoch: [],
        invoice_total_amount: ['0.00'],
        tax_amount: ['0.00'],
        assign_to: [''],
        status: [''],
      });
      this.pdf_url = this.documentData.pdf_url;
      this.pdfLoader = false;
      this.uiSpinner.spin$.next(false);
    }
  }

  async saveInformation() {
    if (this.invoiceForm.valid) {
      const formValues = this.invoiceForm.value;
      formValues.invoice_total_amount = formValues.invoice_total_amount.toString().replace(/,/g, '');
      formValues.tax_amount = formValues.tax_amount.toString().replace(/,/g, '');
      formValues._id = this.id;
      if (formValues.invoice_date_epoch == null) {
        formValues.invoice_date_epoch = 0;
      } else {
        formValues.invoice_date_epoch = Math.round(formValues.invoice_date_epoch.valueOf() / 1000);
      }
      if (formValues.due_date_epoch == null) {
        formValues.due_date_epoch = 0;
      } else {
        formValues.due_date_epoch = Math.round(formValues.due_date_epoch.valueOf() / 1000);
      }
      if (formValues.status == 'Rejected') {

        const dialogRef = this.dialog.open(InvoiceRejectedReasonComponent, {
          width: '28%',
          data: {},
        });
        this.subs.sink = dialogRef.afterClosed().subscribe(async (result: any) => {
          if (result) {
            if (result.status) {
              this.uiSpinner.spin$.next(true);
              formValues.reject_reason = result.reject_reason;
              const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, formValues);
              this.uiSpinner.spin$.next(false);
              if (data.status) {
                showNotification(this.snackBar, data.message, 'success');
                this.rejectReason = result.reject_reason;
              } else {
                showNotification(this.snackBar, data.message, 'error');
              }
            }
          }
        });
      } else {
        this.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, formValues);
        this.uiSpinner.spin$.next(false);
        if (data.status) {
          showNotification(this.snackBar, data.message, 'success');
        } else {
          showNotification(this.snackBar, data.message, 'error');
        }
      }
    }
  }

  async saveOtherDocument() {
    if (this.invoiceForm.valid) {
      const formValues = this.invoiceForm.value;
      formValues.invoice_total_amount = formValues.invoice_total_amount.toString().replace(/,/g, '');
      formValues.tax_amount = formValues.tax_amount.toString().replace(/,/g, '');
      formValues.pdf_url = this.documentData.pdf_url;
      formValues.document_id = this.documentId;
      if (formValues.status == '') {
        formValues.status = 'Pending';
      }
      if (formValues.invoice_date_epoch == null) {
        formValues.invoice_date_epoch = 0;
      } else {
        formValues.invoice_date_epoch = Math.round(formValues.invoice_date_epoch.valueOf() / 1000);
      }
      if (formValues.due_date_epoch == null) {
        formValues.due_date_epoch = 0;
      } else {
        formValues.due_date_epoch = Math.round(formValues.due_date_epoch.valueOf() / 1000);
      }
      if (formValues.status == 'Rejected') {
        const dialogRef = this.dialog.open(InvoiceRejectedReasonComponent, {
          width: '28%',
          data: {},
        });
        this.subs.sink = dialogRef.afterClosed().subscribe(async (result: any) => {
          if (result) {
            if (result.status) {
              this.uiSpinner.spin$.next(true);
              formValues.reject_reason = result.reject_reason;
              const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_OTHER_DOCUMENT_INVOICE, formValues);
              this.uiSpinner.spin$.next(false);
              if (data.status) {
                showNotification(this.snackBar, data.message, 'success');
                this.rejectReason = result.reject_reason;
                this.back();
              } else {
                showNotification(this.snackBar, data.message, 'error');
              }
            }
          }
        });
      } else {
        this.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_OTHER_DOCUMENT_INVOICE, formValues);
        this.uiSpinner.spin$.next(false);
        if (data.status) {
          showNotification(this.snackBar, data.message, 'success');
          this.back();
        } else {
          showNotification(this.snackBar, data.message, 'error');
        }
      }
    }
  }

  async updateStatus(status: string) {
    console.log("status", status);
    let message: any;
    if (status == 'Rejected') {
      message = `Are you sure you want to reject this invoice?`;
    } else if (status == 'On Hold') {
      message = `Are you sure you want to put this invoice on hold?`;
    } else if (status == 'Approved') {
      message = `Are you sure you want to approve this invoice?`;
    }

    swalWithBootstrapTwoButtons
      .fire({
        title: message,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          if (status == 'Rejected') {
            const dialogRef = this.dialog.open(InvoiceRejectedReasonComponent, {
              width: '28%',
              data: {},
            });
            this.subs.sink = dialogRef.afterClosed().subscribe(async (result: any) => {
              if (result) {
                if (result.status) {
                  this.uiSpinner.spin$.next(true);
                  const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, { _id: this.id, status: status, reject_reason: result.reject_reason });
                  this.uiSpinner.spin$.next(false);
                  if (data.status) {
                    showNotification(this.snackBar, 'Invoice status updated successfully.', 'success');
                    this.rejectReason = result.reject_reason;
                    this.invoiceForm.get('status')?.setValue(status);
                  } else {
                    showNotification(this.snackBar, data.message, 'error');
                  }
                }
              }
            });
          } else {
            this.rejectReason = '';
            this.uiSpinner.spin$.next(true);
            const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, { _id: this.id, status: status });
            this.uiSpinner.spin$.next(false);
            if (data.status) {
              showNotification(this.snackBar, 'Invoice status updated successfully.', 'success');
              this.invoiceForm.get('status')?.setValue(status);
            } else {
              showNotification(this.snackBar, data.message, 'error');
            }
          }
        }
      });

  }

  async saveMoreInformation() {
    if (this.moreInformationForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.moreInformationForm.value;
      formValues.sub_total = formValues.sub_total.toString().replace(/,/g, '');
      formValues.amount_due = formValues.amount_due.toString().replace(/,/g, '');
      formValues._id = this.id;
      if (formValues.order_date_epoch == null) {
        formValues.order_date_epoch = 0;
      } else {
        formValues.order_date_epoch = Math.round(formValues.order_date_epoch.valueOf() / 1000);
      }
      if (formValues.ship_date_epoch == null) {
        formValues.ship_date_epoch = 0;
      } else {
        formValues.ship_date_epoch = Math.round(formValues.ship_date_epoch.valueOf() / 1000);
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async saveNote() {
    if (this.noteForm.valid) {
      this.uiSpinner.spin$.next(true);
      const formValues = this.noteForm.value;
      formValues.invoice_id = this.id;
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE_NOTE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        this.noteForm.get('notes')?.setValue('');
        showNotification(this.snackBar, data.message, 'success');
        this.getOneInvoice();
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  deleteNotes(note: any) {
    swalWithBootstrapTwoButtons
      .fire({
        title: 'Are you sure you want to delete this note?',
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          const requestObject = {
            invoice_id: this.id,
            _id: note._id,
            notes: note.notes,
          };
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE_NOTE, requestObject);
          this.uiSpinner.spin$.next(false);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.notes.findIndex((x: any) => x._id === note._id);
            if (foundIndex != null) {
              this.notes.splice(foundIndex, 1);
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  downloadDocument(document: any) {
    window.location.href = document.pdf_url;
  }

  back() {
    if (this.documentId) {
      this.router.navigate([WEB_ROUTES.DOCUMENTS]);
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE]);
    }
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.INVOICE_HISTORY], { queryParams: { _id: this.id } });
  }

  sendMessage() {
    if (this.invoiceMessages.length == 0) {
      const dialogRef = this.dialog.open(SendInvoiceMessageComponent, {
        width: '28%',
        data: {},
      });
      this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
        this.getOneInvoice();
      });
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE_MESSAGE_VIEW], { queryParams: { invoice_id: this.id } });
    }
  }

  addmail() {
    const dialogRef = this.dialog.open(MailFormComponent, {
      width: '600px',
      height: '600px',
      data: this.invoiceData,
    });
    dialogRef.afterClosed().subscribe((result) => { });
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

  async removePDF() {
    this.uiSpinner.spin$.next(true);
    const requestObject = {
      _id: this.id,
      pdf_url: '',
    };
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, requestObject);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      this.pdf_url = '';
      this.pdfLoader = true;
      setTimeout(() => {
        this.pdfLoader = false;
      }, 200);
    }
  }

  download() {
    let a = document.createElement('a');
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

  addCloseInvoiceInfo() {
    if (this.allowEditInfo) {
      this.allowEditInfo = false;
      this.userControl.setValue('');
      this.costCodeControl.setValue('');
      this.clientControl.setValue('');
      this.classNameControl.setValue('');
      this.infoNotes = '';
      this.infoAmount = '0.00';
      this.infoId = null;
    } else {
      this.showInfoForm = !this.showInfoForm;
    }
  }

  async saveInvoiceInfo() {
    let assignTo = '';
    if (this.userControl.value) {
      assignTo = this.userControl.value._id;
    }
    let costCodeId = '';
    if (this.costCodeControl.value) {
      costCodeId = this.costCodeControl.value._id;
    }
    let clientId = '';
    if (this.clientControl.value) {
      clientId = this.clientControl.value._id;
    }
    let classId = '';
    if (this.classNameControl.value) {
      classId = this.classNameControl.value._id;
    }
    if (this.infoAmount == '') {
      showNotification(this.snackBar, 'Please enter invoice amount.', 'error');
    } else {
      this.infoAmount = this.infoAmount.toString().replace(/,/g, "");
      if (Number(this.infoAmount) > this.invoiceData.invoice_total_amount) {
        showNotification(this.snackBar, 'Amount must be not more then invoice amount.', 'error');
      } else {
        let requestObject;
        if (this.infoId) {
          requestObject = {
            _id: this.infoId,
            invoice_id: this.id,
            amount: this.infoAmount,
            job_client_name: clientId,
            class_name: classId,
            cost_code_gl_account: costCodeId,
            assign_to: assignTo,
            notes: this.infoNotes,
          };
        } else {
          requestObject = {
            invoice_id: this.id,
            amount: this.infoAmount,
            job_client_name: clientId,
            class_name: classId,
            cost_code_gl_account: costCodeId,
            assign_to: assignTo,
            notes: this.infoNotes,
          };
        }
        this.uiSpinner.spin$.next(true);
        const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE_INFO, requestObject);
        this.uiSpinner.spin$.next(false);
        if (data.status) {
          showNotification(this.snackBar, data.message, 'success');
          this.addCloseInvoiceInfo();
          this.getOneInvoice();
        } else {
          showNotification(this.snackBar, data.message, 'error');
        }
      }
    }
  }

  editInvoiceInfo(info: any, index: number) {
    // this.invoiceInfoData = info;
    this.infoId = info._id;
    const foundUser = this.userList.find((x: UserModel) => x._id === info.assign_to);
    if (foundUser) {
      this.userControl.setValue(foundUser);
    }
    const foundCostCode = this.costCodeList.find((x: CostCodeModel) => x._id === info.cost_code_gl_account);
    if (foundCostCode) {
      this.costCodeControl.setValue(foundCostCode);
    }
    const foundClient = this.jobNameList.find((x: ClientJobModel) => x._id === info.job_client_name);
    if (foundClient) {
      this.clientControl.setValue(foundClient);
    }
    const foundClass = this.classNameList.find((x: ClassNameModel) => x._id === info.class_name);
    if (foundClass) {
      this.classNameControl.setValue(foundClass);
    }
    this.infoNotes = info.notes;
    this.infoAmount = numberWithCommas(info.amount.toFixed(2));
    this.infoEditIndex = index;
    this.allowEditInfo = true;
  }

  deleteInvoiceInfo(info: any) {
    swalWithBootstrapTwoButtons
      .fire({
        title: 'Are you sure you want to delete this info?',
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE_INFO, { _id: info._id, invoice_id: this.id });
          this.uiSpinner.spin$.next(false);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.invoiceInfo.findIndex((x: any) => x._id === info._id);
            if (foundIndex != null) {
              this.invoiceInfo.splice(foundIndex, 1);
            }
            this.loadInvoiceInfo = false;
            setTimeout(() => {
              this.loadInvoiceInfo = true;
            }, 100);
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  infoAmountChange(params: any, controller: string) {
    this.invoiceForm.get(controller)?.setValue(amountChange(params));
  }

  moreInfoAmountChange(params: any, controller: string) {
    this.moreInformationForm.get(controller)?.setValue(amountChange(params));
  }

  amountChange(params: any) {
    this.infoAmount = amountChange(params);
  }

  numberWithCommas(amount: number) {
    return numberWithCommas(amount.toFixed(2));
  }

  setInfoCostCode(id: string) {
    const found = this.costCodeList.find((x: CostCodeModel) => x._id === id);
    if (found) {
      return found.cost_code;
    } else {
      return '';
    }
  }

  setInfoApprover(id: string) {
    const found = this.userList.find((x: UserModel) => x._id === id);
    if (found) {
      return found.userfullname;
    } else {
      return '';
    }
  }

  setInfoClientJob(id: string) {
    const found = this.jobNameList.find((x: ClientJobModel) => x._id === id);
    if (found) {
      return found.client_name;
    } else {
      return '';
    }
  }

  setInfoClassName(id: string) {
    const found = this.classNameList.find((x: ClassNameModel) => x._id === id);
    if (found) {
      return found.name;
    } else {
      return '';
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
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_INVOICE, requestObject);
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

  uploadSupportingDocument() {
    const dialogRef = this.dialog.open(UploadInvoiceFormComponent, {
      width: '80%',
      data: {
        supporting: true,
        vendor: this.invoiceData.vendor
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      if (result.status) {
        this.uiSpinner.spin$.next(true);
        this.getOneInvoice();
      }
    });
  }

  viewSupportingDocument(document: any) {
    this.router.navigate([WEB_ROUTES.INVOICE_VIEW_DOCUMENT], { queryParams: { document: document.document_type, _id: document._id } });
  }

  async deleteSupportingDocument(document: any) {
    this.uiSpinner.spin$.next(true);
    let apiUrl = '';
    if (document.document_type == configData.DOCUMENT_TYPES.po) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.DELETE_AP_PO;
    } else if (document.document_type == configData.DOCUMENT_TYPES.quote) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.DELETE_AP_QUOTE;
    } else if (document.document_type == configData.DOCUMENT_TYPES.packingSlip) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.DELETE_AP_PACKLING_SLIP;
    } else if (document.document_type == configData.DOCUMENT_TYPES.receivingSlip) {
      apiUrl = httpversion.PORTAL_V1 + httproutes.DELETE_AP_RECEVING_SLIP;
    }
    const data = await this.commonService.postRequestAPI(apiUrl, { _id: document._id, is_delete: 1 });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.getOneInvoice();
    } else {
      this.uiSpinner.spin$.next(false);
      showNotification(this.snackBar, data.message, 'error');
    }
  }
}
