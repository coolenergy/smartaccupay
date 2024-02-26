import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonFileChangeEvent, commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer, formatPhoneNumber, gallery_options, LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../map/mode-detect.service';
import moment from "moment";


const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'

});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  isManagement: boolean = true;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  viewicon = icon.VIEW_WHITE;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  username_search: any;
  gridtolist: Boolean = true;
  addTeamMember: boolean = true;
  locallanguage: any;
  invoice_search: any;
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  subscription!: Subscription;
  historyIcon!: string;
  trashIcon!: string;
  importIcon!: string;
  editIcon!: string;
  gridIcon: string;
  listIcon: string;
  denyIcon: string;
  approveIcon: string;
  sorting_asc: Boolean = false;
  sorting_desc: Boolean = false;
  soruing_all: Boolean = true;
  allInvoices: any = [];
  vendorsList = [];
  viewIcon: string = '';
  invoiceCount: any = {
    pending: 0,
    complete: 0
  };
  add_my_self_ico = icon.ADD_MY_SELF_WHITE;
  reportIcon: string = "";
  role_to: any;
  role_permission: any;
  invoice_status: any = ['All'];

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  showInvoiceTable = true;
  dtOptions: DataTables.Settings = {};
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  dateRange: any = [];

  constructor (private router: Router, private modeService: ModeDetectService, public mostusedservice: Mostusedservice,
    public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {

    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    let tmp_gridtolist_team = localStorage.getItem("gridtolist_invoice_list");
    this.gridtolist =
      tmp_gridtolist_team == "grid" || tmp_gridtolist_team == null
        ? true
        : false;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.trashIcon = icon.DELETE;
      this.editIcon = icon.EDIT;
      this.reportIcon = icon.REPORT;
      this.viewIcon = icon.VIEW;
      this.gridIcon = icon.GRID;
      this.listIcon = icon.List;
      this.denyIcon = icon.DENY;
      this.approveIcon = icon.APPROVE;

    } else {
      this.trashIcon = icon.DELETE_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.reportIcon = icon.REPORT_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.gridIcon = icon.GRID_WHITE;
      this.listIcon = icon.List_LIGHT;
      this.denyIcon = icon.DENY_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.trashIcon = icon.DELETE;
        this.editIcon = icon.EDIT;
        this.reportIcon = icon.REPORT;
        this.viewIcon = icon.VIEW;
        this.gridIcon = icon.GRID;
        this.listIcon = icon.List;
        this.denyIcon = icon.DENY;
        this.approveIcon = icon.APPROVE;

      } else {
        this.mode = 'on';
        this.trashIcon = icon.DELETE_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.reportIcon = icon.REPORT_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.gridIcon = icon.GRID_WHITE;
        this.listIcon = icon.List_LIGHT;
        this.denyIcon = icon.DENY_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;

      }
      this.rerenderfunc();
    });

    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.Company_Equipment_File_Not_Match = this.translate.instant('Company_Equipment_File_Not_Match');
    });
  }

  ngOnInit(): void {
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    this.role_to = role_permission.UserData.role_name;

    let that = this;
    this.getAllVendors();
    this.uiSpinner.spin$.next(true);
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      that.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      that.inacticve_word = this.translate.instant('project_setting_inactive');

      that.translate.get('Employee-List-list-to-grid').subscribe((text: string) => {
        that.listtogrid_text = text;
      });

      that.translate.get('Employee-List-grid-to-list').subscribe((text: string) => {
        that.gridtolist_text = text; that.btn_grid_list_text = text;
      });

      if (this.locallanguage === 'en') {
        this.locallanguage = 'es';
      } else {
        this.locallanguage = 'en';
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      i++;
    });
    that.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };

    this.getAllInvoices();

  }

  dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    this.dateRange = [dateRangeStart.value, dateRangeEnd.value];
    // this.dateRange = [timeDateToepoch(dateRangeStart.value), timeDateToepoch(dateRangeEnd.value)];
  }

  rerenderfunc() {
    this.showInvoiceTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.showInvoiceTable = true;
    }, 100);
  }
  sorting_name() {
    if (this.sorting_desc) {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.sort((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));
    } else if (this.sorting_asc) {
      this.sorting_desc = true;
      this.sorting_asc = false;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.reverse((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));

    } else {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.sort((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));
    }
  }

  searchData(searchValue: any) {
    this.allInvoices = this.allInvoices.filter((item: any) => {
      return item.invoice_no.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  gotoArchive() {
    this.router.navigateByUrl('/archive-team-list');
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }
  updateInvoice(requestObject) {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);

      }
    });
  }


  gridTolist() {
    if (this.gridtolist) {
      this.rerenderfunc();
      this.btn_grid_list_text = this.listtogrid_text;
      localStorage.setItem('gridtolist_invoice_list', "list");
      this.gridtolist = false;
    } else {
      this.btn_grid_list_text = this.gridtolist_text;
      localStorage.setItem('gridtolist_invoice_list', "grid");
      this.gridtolist = true;
    }
  }

  invoiceUpdateCard() {
    this.getAllInvoices();
  }

  getAllInvoices() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.INVOICE_GET_LIST).subscribe(function (params) {
      if (params.status) {
        that.allInvoices = params.data;
        that.invoiceCount = params.count;
        that.isManagement = params.is_management;
      }
      that.uiSpinner.spin$.next(false);
      that.showInvoiceTable = false;
      setTimeout(() => {
        that.showInvoiceTable = true;
      }, 100);
    });
  }

  getAllVendors() {
    let that = this;
    that.httpCall
      .httpGetCall(httproutes.INVOICE_VENDOR_GET)
      .subscribe(function (params) {
        if (params.status) {
          that.vendorsList = params.data;
        }
      });
  }


  invoiceReportDialog() {
    const dialogRef = this.dialog.open(InvoiceReport, {
      height: '500px',
      width: '800px',
      data: { vendorList: this.vendorsList, },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  viewDocuments() {
    this.router.navigate(['/documents-list']);
  }

  checkProcessProgress() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_PROCESS_PROGRESS).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  importProcessData() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_PROCESS_INVOICE_DATA).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  viewInvoice(invoice) {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });
  }

  editInvoice(invoice) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id } });
  }


  openAddDialog() {
    let that = this;
    const dialogRef = this.dialog.open(InvoiceAttachment, {
      height: '400px',
      width: '700px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      that.getAllInvoices();
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  importManagementInvoice() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_IMPORT_MANAGEMENT_INVOICE).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  importManagementPO() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_IMPORT_MANAGEMENT_PO).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }
}


@Component({
  selector: 'invoice-attachment-form',
  templateUrl: './invoice-attachment-form.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceAttachment {
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

  constructor (private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<InvoiceAttachment>,
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
      if (result) {
        if (result.status) {
          this.prepareFilesList(files.target.files);
        } else {
          this.snackbarservice.openSnackBar(this.FILE_NOT_SUPPORTED, "error");
        }
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
  selector: 'invoice-report',
  templateUrl: './invoice-report.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceReport {
  is_oneOnly: boolean = true;
  public form: any;
  public vendorList = [];
  selectedRoles: any;
  public statusList = configdata.INVOICES_STATUS;
  selectedStatus: any;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  invoiceinfo: FormGroup;
  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;

  constructor (private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<InvoiceReport>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService) {

    this.Report_File_Message = this.translate.instant('Report_File_Message');
    this.Report_File_Enter_Email = this.translate.instant('Report_File_Enter_Email');
    this.vendorList = data.vendorList;
    this.invoiceinfo = this.formBuilder.group({
      All_Vendors: [true],
      vendor_ids: [this.vendorList.map((el: any) => el._id)],
      All_Status: [true],
      status: [this.statusList.map((el: any) => el.name)],
    });

    if (data.status) {
      this.invoiceinfo.get('All_Status').setValue(false);
      this.invoiceinfo.get('status').setValue([data.status]);
    }

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;
      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;
      }
    });

  }

  isValidMailFormat(value: any) {
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (value != "" && (EMAIL_REGEXP.test(value))) {
      return { "Please provide a valid email": true };
    }
    return null;
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
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
  };

  internalEmailremove(email: any): void {
    //----
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
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

  ngOnInit(): void {
    let that = this;
    this.invoiceinfo.get("vendor_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.vendorList.length) {
        that.invoiceinfo.get("All_Vendors")!.setValue(true);
      } else {
        that.invoiceinfo.get("All_Vendors")!.setValue(false);
      }
    });
    this.invoiceinfo.get("status")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.statusList.length) {
        that.invoiceinfo.get("All_Status")!.setValue(true);
      } else {
        that.invoiceinfo.get("All_Status")!.setValue(false);
      }
    });
  };

  onChangeValueAll_Vendors(params: any) {
    if (params.checked) {
      this.invoiceinfo.get("vendor_ids")!.setValue(this.vendorList.map((el: any) => el._id));
    } else {
      this.invoiceinfo.get("vendor_ids")!.setValue([]);
    }
  }

  onChangeValueAll_Status(params: any) {
    if (params.checked) {
      this.invoiceinfo.get("status")!.setValue(this.statusList.map(el => el.name));
    } else {
      this.invoiceinfo.get("status")!.setValue([]);
    }
  }

  saveData() {
    if (this.emailsList.length != 0) {
      this.sb.openSnackBar(this.Report_File_Message, "success");
      let requestObject = this.invoiceinfo.value;

      let date_time = this.range.value;
      let start_date = 0, end_date = 0;
      let todayDate = new Date();
      todayDate.setHours(0);
      todayDate.setMinutes(0);
      todayDate.setSeconds(0);
      todayDate.setDate(todayDate.getDate() + 1);
      if (date_time.start_date) {
        start_date = moment(date_time.start_date).unix();
        if (date_time.end_date) { } else {
          end_date = moment(todayDate).unix();
          end_date = end_date - 1;
        }
      }
      if (date_time.end_date) {
        let end = moment(date_time.end_date);
        end.add('days', 1);
        end_date = end.unix() - 1;
      }

      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      requestObject.email_list = this.emailsList;
      requestObject.logo_url = company_data.companydata.companylogo;
      requestObject.start_date = start_date;
      requestObject.end_date = end_date;

      this.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_REPORT, requestObject).subscribe(function (params: any) { });
      setTimeout(() => {
        this.dialogRef.close();
      }, 3000);
    } else {
      this.sb.openSnackBar(this.Report_File_Enter_Email, "error");
    }
  }
  addmyself() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }
}