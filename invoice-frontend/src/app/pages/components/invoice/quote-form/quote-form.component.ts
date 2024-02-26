import { Component, OnInit, } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Observable, Subscription } from 'rxjs';
import { epochToDateTime } from 'src/app/service/utils';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';

import { EmployeeService } from '../../team/employee.service';
import { map, startWith } from 'rxjs/operators';
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
  selector: 'app-quote-form',
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss']
})
export class QuoteFormComponent implements OnInit {
  filepath: any;
  item_image_url: String = "./assets/images/currentplaceholder.png";

  startDate: any;
  endDate: any;
  showHeader = false;
  one_template: any;
  mode: any;
  backIcon: string = "";
  downloadIcon: string = "";
  saveIcon = icon.SAVE_WHITE;
  subscription!: Subscription;
  exitIcon: string = "";
  printIcon: string = "";
  close_this_window: string = "";
  All_popup_Cancel = "";
  All_Save_Exit = "";
  Dont_Save = "";
  invoiceform: FormGroup;
  Email_Template_Form_Submitting = "";
  id: any;
  isManagement: boolean = true;

  isEmployeeData: Boolean = false;
  // db_costcodes
  variablesdb_costcodes: any = [];
  db_costcodes: any = this.variablesdb_costcodes.slice();
  // usersArray
  variablesusersArray: any = [];
  usersArray: any = this.variablesusersArray.slice();
  approveIcon: string;
  denyIcon: string;
  // DOCUMENT TYPE
  variablesDocumenttype: any = configdata.DOCUMENT_TYPE;
  DocumentType = this.variablesDocumenttype.slice();

  pdf_url = "";
  invoiceData: any;
  statusList = configdata.INVOICE_STATUS;
  invoice_id: any;
  loadInvoice: boolean = false;
  badge: any = [];
  status: any;
  filteredOptions: Observable<string[]>;
  vendor = new FormControl('');
  filteredVendors: Observable<any[]>;
  vendorList: any = [];
  viewIcon: any;
  document_id: any;
  badgeIcon = icon.BADGE_ICON;
  document_type: any;
  hideToggle = false;
  hide: Boolean = true;
  disabled = false;
  multi = false;
  displayMode: string = 'default';
  showApproveButton: boolean = false;
  defalut_image = icon.MALE_PLACEHOLDER;
  module: any = {
    Invoice: 'Invoice',
    Po: 'PO',
    PackingSlip: 'Packing Slip',
    ReceivingSlip: 'Receiving Slip',
    Quote: 'Quote',
  };

  constructor (public employeeservice: EmployeeService, private location: Location, private modeService: ModeDetectService, public snackbarservice: Snackbarservice, private formBuilder: FormBuilder,
    public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public route: ActivatedRoute, public translate: TranslateService) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.document_id = this.route.snapshot.queryParamMap.get('document_id');
    this.document_type = this.route.snapshot.queryParamMap.get('document_type');
    this.invoice_id = this.id;
    if (this.id) {
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
    }
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      this.close_this_window = this.translate.instant("close_this_window");
      this.All_popup_Cancel = this.translate.instant('All_popup_Cancel');
      this.All_Save_Exit = this.translate.instant('All_Save_Exit');
      this.Dont_Save = this.translate.instant('Dont_Save');
      this.Email_Template_Form_Submitting = this.translate.instant('Email_Template_Form_Submitting');
    });
    this.invoiceform = this.formBuilder.group({
      document_type: [""],
      quote_number: [""],
      vendor: [""],
      sub_total: [""],
      date_epoch: [""],
      terms: [""],
      address: [""],
      shipping_method: [""],
      tax: [""],
      receiver_phone: [""],
      quote_total: [""],
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
    } else {

      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.denyIcon = icon.DENY_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.denyIcon = icon.DENY_WHITE;
      }
    });
    if (this.id) {
      this.getOneInvoice();
    }
    if (this.document_id) {
      this.getOneProcessDocument();
    }
  }

  // back() {
  //   if (this.id) {
  //     this.router.navigate(['/invoice-detail'], { queryParams: { _id: this.invoice_id } });
  //   } else if (this.document_id) {
  //     this.router.navigate(['/documents-list']);
  //   } else {
  //     this.location.back();
  //   }
  // }
  back() {

    if (this.id) {
      this.router.navigate(['/invoice-detail'], { queryParams: { _id: this.invoice_id } });
    } else if (this.document_id) {
      var from = this.route.snapshot.queryParamMap.get('from');
      if (from) {
        this.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: this.pdf_url, document_id: this.document_id, document_type: this.document_type, is_delete: 0, status: 'status' } });
      } else {
        this.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: this.pdf_url, document_id: this.document_id, document_type: this.document_type, is_delete: 0, counts: 'counts' } });
      }
    } else {
      this.location.back();
    }
  }
  ngOnInit(): void {
    let that = this;
    this.getAllVendorList();
    this.filteredVendors = this.vendor.valueChanges.pipe(
      startWith(''),
      map(value => this._filterVendor(value || '')),
    );
    this.employeeservice.getalluser().subscribe(function (data) {
      that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        // that.usersArray = data.data;
        that.variablesusersArray = data.data;
        that.usersArray = that.variablesusersArray.slice();
        that.isManagement = data.is_management;
      }
    });
    that.getAllCostCode();
  }

  private _filterVendor(value: any): any[] {
    return this.vendorList.filter(one_vendor => {
      let vendor_name = value.vendor_name ? value.vendor_name : value;
      return one_vendor.vendor_name.toLowerCase().indexOf(vendor_name.toLowerCase()) > -1;
    });

  }

  async getAllVendorList() {
    let data = await this.httpCall.httpGetCall(httproutes.PORTAL_COMPANY_VENDOR_GET_BY_ID).toPromise();
    if (data.status) {
      this.vendorList = data.data;
    }
  }
  getIdFromVendor(event, Option) {
    this.invoiceform.get('vendor').setValue(Option._id);
  }

  displayOption(option: any): string {
    return option ? option.vendor_name : option;
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
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }

  getAllCostCode() {
    let that = this;
    that.httpCall.httpPostCall(httproutes.PROJECT_SETTING_COST_CODE, { module: 'Invoice' }
    ).subscribe(function (params) {
      if (params.status) {
        that.variablesdb_costcodes = params.data;
        that.db_costcodes = that.variablesdb_costcodes.slice();
      }
    });
  }

  getOneInvoice() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id }).subscribe(function (params) {
      if (params.status) {
        that.invoiceData = params.data;
        that.pdf_url = that.invoiceData.quote_data.pdf_url;
        that.badge = that.invoiceData.quote_data.badge;
        that.vendor.setValue(params.data.vendor);
        that.loadInvoice = true;
        var date;
        if (params.data.quote_data.date_epoch != 0) {
          date = epochToDateTime(params.data.quote_data.date_epoch);
        }
        that.invoiceform = that.formBuilder.group({
          terms: [params.data.quote_data.terms],
          sub_total: [params.data.quote_data.sub_total],
          vendor: [params.data.vendor._id],
          document_type: [params.data.quote_data.document_type],
          tax: [params.data.quote_data.tax],
          date_epoch: [date],
          quote_number: [params.data.quote_data.quote_number],
          address: [params.data.quote_data.address],
          shipping_method: [params.data.quote_data.shipping_method],
          receiver_phone: [params.data.quote_data.receiver_phone],
          quote_total: [params.data.quote_data.quote_total],
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }

  getOneProcessDocument() {
    let that = this;
    this.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_GET, { _id: that.document_id }).subscribe(function (params) {
      if (params.status) {
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
        var date;
        if (that.invoiceData.date_epoch != 0 && that.invoiceData.date_epoch != undefined && that.invoiceData.date_epoch != null) {
          date = epochToDateTime(that.invoiceData.date_epoch);
        }
        if (that.invoiceData.document_type == undefined || that.invoiceData.document_type == null || that.invoiceData.document_type == '' || that.invoiceData.document_type == 'UNKNOWN') {
          that.invoiceData.document_type = that.document_type;
        }
        that.invoiceform = that.formBuilder.group({
          terms: [that.invoiceData.terms],
          sub_total: [that.invoiceData.sub_total],
          vendor: [vendorId],
          document_type: [that.invoiceData.document_type],
          tax: [that.invoiceData.tax],
          date_epoch: [date],
          quote_number: [that.invoiceData.quote_number],
          address: [that.invoiceData.address],
          shipping_method: [that.invoiceData.shipping_method],
          receiver_phone: [that.invoiceData.receiver_phone],
          quote_total: [that.invoiceData.quote_total],
        });
      }
      that.uiSpinner.spin$.next(false);
    });
  }

  saveData() {
    if (this.id) {
      this.saveInvoice();
    } else if (this.document_id) {
      this.saveProcessDocument();
    }
  }
  saveInvoice() {
    let that = this;
    if (that.invoiceform.valid) {
      let formVal = that.invoiceform.value;
      if (formVal.date_epoch == null) {
        formVal.date_epoch = 0;
      } else {
        formVal.date_epoch = Math.round(formVal.date_epoch.valueOf() / 1000);
      }
      let requestObject = {
        _id: that.id,
        module: 'Quote',
        'quote_data.date_epoch': formVal.date_epoch,
        'quote_data.document_type': formVal.document_type,
        'quote_data.quote_number': formVal.quote_number,
        'quote_data.sub_total': formVal.sub_total,
        'quote_data.vendor': formVal.vendor,
        'quote_data.terms': formVal.terms,
        'quote_data.shipping_method': formVal.shipping_method,
        'quote_data.tax': formVal.tax,
        'quote_data.received_by': formVal.received_by,
        'quote_data.receiver_phone': formVal.receiver_phone,
        'quote_data.quote_total': formVal.quote_total,
      };
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_UPDATE_QUOTE, requestObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
        that.uiSpinner.spin$.next(false);
      });
    }
  }

  saveProcessDocument() {
    let that = this;
    if (that.invoiceform.valid) {
      let formVal = that.invoiceform.value;
      if (formVal.date_epoch == null) {
        formVal.date_epoch = 0;
      } else {
        formVal.date_epoch = Math.round(formVal.date_epoch.valueOf() / 1000);
      }
      let requestObject = {
        _id: that.document_id,
        module: 'Quote',
        'data.date_epoch': formVal.date_epoch,
        'data.document_type': formVal.document_type,
        'data.quote_number': formVal.quote_number,
        'data.sub_total': formVal.sub_total,
        'data.vendor': formVal.vendor,
        'data.terms': formVal.terms,
        'data.shipping_method': formVal.shipping_method,
        'data.tax': formVal.tax,
        'data.received_by': formVal.received_by,
        'data.receiver_phone': formVal.receiver_phone,
        'data.quote_total': formVal.quote_total,
      };
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.INVOICE_DOCUMENT_PROCESS_SAVE, requestObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.back();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
        that.uiSpinner.spin$.next(false);
      });
    }
  }
}