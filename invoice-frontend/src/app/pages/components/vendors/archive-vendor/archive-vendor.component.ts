import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonNewtworkAttachmentViewer, formatPhoneNumber, gallery_options, LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
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
  selector: 'app-archive-vendor',
  templateUrl: './archive-vendor.component.html',
  styleUrls: ['./archive-vendor.component.scss']
})
export class ArchiveVendorComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;
  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  dtOptions: any = {};
  imageObject: any;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  locallanguage: string;
  Vendor_VendorName: string;
  showTable: boolean = true;
  Vendor_Phone: string;
  Vendor_Email: string;
  Vendor_Address: string;
  Vendor_Action: string;
  Vendor_Attachments: string;
  Vendor_Status: string;
  Vendor_Description: string;
  Vendor_CostCode: string;
  Vendor_Terms: string;
  Vendor_ZipCode: string;
  Customer_Id: string;
  Vendor_ID: string;
  confirmation_vendor_restore: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Restore_all: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  mode: any;
  subscription: Subscription;
  yesButton: string = "";
  noButton: string = "";
  backIcon: string;
  restoreIcon: string;

  constructor(private modeService: ModeDetectService,
    private location: Location,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public translate: TranslateService) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.restoreIcon = icon.RESTORE;
      this.backIcon = icon.BACK;
    } else {
      this.restoreIcon = icon.RESTORE_WHITE;
      this.backIcon = icon.BACK_WHITE;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.restoreIcon = icon.RESTORE;
        this.backIcon = icon.BACK;
      } else {
        this.mode = "on";
        this.restoreIcon = icon.RESTORE_WHITE;
        this.backIcon = icon.BACK_WHITE;
      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    const that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream([""]).subscribe((textarray) => {
      that.acticve_word = this.translate.instant(
        "Team-EmployeeList-Status-Active"
      );
      that.inacticve_word = this.translate.instant("project_setting_inactive");
      that.Vendor_VendorName = that.translate.instant("Vendor_VendorName");
      that.Vendor_Phone = that.translate.instant("Vendor_Phone");
      that.Vendor_Email = that.translate.instant("Vendor_Email");
      that.Vendor_Address = that.translate.instant("Vendor_Address");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Vendor_Attachments = that.translate.instant("Vendor_Attachments");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.Vendor_Description = that.translate.instant("Vendor_Description");
      that.Vendor_Terms = that.translate.instant("Vendor_Terms");
      that.Customer_Id = that.translate.instant("Customer_Id");
      that.Vendor_ID = that.translate.instant("Vendor_ID");
      that.confirmation_vendor_restore = that.translate.instant(
        "confirmation_vendor_restore"
      );
      that.Compnay_Equipment_Delete_Yes = that.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      that.Compnay_Equipment_Delete_No = that.translate.instant(
        "Compnay_Equipment_Delete_No"
      );


      that.Restore_all = that.translate.instant(
        "Restore_all"
      );
      if (this.locallanguage === "en") {
        this.locallanguage = "es";
      } else {
        this.locallanguage = "en";
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 1000);
      }
      i++;
    });

    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language, });
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: false,
      language:
        portal_language == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );
        dataTablesParameters.is_delete = 1;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.INVOICE_GET_VENDOR_DATATABLES,
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

      drawCallback: () => {
        $(".button_attachment").on("click", (event) => {
          this.imageObject = JSON.parse(event.target.getAttribute("edit_tmp_id")).vendor_attachment;
          this.galleryImages = commonNewtworkAttachmentViewer(this.imageObject);
          setTimeout(() => {
            this.gallery.openPreview(0);
          }, 0);
        });

        $(".button_shiftDeleteClass").on("click", (event) => {
          // Delete Vendor here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.restoreVendor(data._id);
        });
      },
    };
  }
  getColumName() {
    let that = this;
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    return [
      {
        title: that.Vendor_VendorName,
        data: "vendor_name",
        defaultContent: "",
      },
      {
        title: that.Vendor_ID,
        data: "vendor_id",
        defaultContent: "",
      },
      {
        title: that.Customer_Id,
        data: "customer_id",
        defaultContent: "",
      },
      {
        title: that.Vendor_Phone,
        render: function (data: any, type: any, full: any) {
          return formatPhoneNumber(full.vendor_phone);
        },
      },
      {
        title: that.Vendor_Email,
        data: "vendor_email",
        defaultContent: "",
      },
      {
        title: that.Vendor_Address,
        data: "vendor_address",
        defaultContent: "",
      },
      {
        title: that.Vendor_Status,
        render: function (data: any, type: any, full: any) {
          var tmp_return;
          if (full.vendor_status == 1) {
            tmp_return =
              `<div class="active-chip-green call-active-inactive-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-check cust-fontsize-right" aria-hidden="true"></i>` +
              that.acticve_word +
              `</div>`;
          } else {
            tmp_return =
              `<div class="inactive-chip-green call-active-active-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-times cust-fontsize-right" aria-hidden="true"></i>` +
              that.inacticve_word +
              `</div>`;
          }
          return tmp_return;
        },
        width: "7%",
      },
      {
        title: that.Vendor_Attachments,
        render: function (data: any, type: any, full: any) {
          let htmlData = ``;
          if (full.vendor_attachment.length != 0) {
            htmlData =
              `<button  edit_tmp_id='` +
              JSON.stringify(full) +
              `' class="cusr-edit-btn-datatable button_attachment" aria-label="Left Align">
          <span class="fas fa-paperclip cust-fontsize-tmp"  edit_tmp_id='` +
              JSON.stringify(full) +
              `' aria-hidden="true"></span>
      </button> `;
          }
          return htmlData;
        },
        width: "1%",
        orderable: false,
      },
      {
        title: that.Vendor_Action,
        render: function (data: any, type: any, full: any) {
          let tmp_tmp = {
            _id: full._id,
          };
          if ("") {
            return (
              `
          <div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
            <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
           
            </div>
        </div>`
            );
          } else {
            return (
              `
          <div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` +
              JSON.stringify(full) +
              `' aria-hidden="true"></i>
            <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
             
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftDeleteClass" >` + '<img src="' + that.restoreIcon + '" alt="" height="15px">' + that.Restore_all + `</a>
            </div>
        </div>`
            );
          }
        },
        width: "1%",
        orderable: false,
      },
    ];
  }
  // implement delete vendor api call
  restoreVendor(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.confirmation_vendor_restore,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.Compnay_Equipment_Delete_Yes,
        denyButtonText: that.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.INVOICE_ARCHIVE_VENDOR, { _id: _id, is_delete: 0 })
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

  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  statusChange(reqObject) {
    var that = this;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_COMPANY_VENDOR_STATUS_CHANGE, reqObject)
      .subscribe(function (data) {
        if (data) {
          that.rerenderfunc();
        }
      });
  }
  back() {
    this.location.back();
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
}

