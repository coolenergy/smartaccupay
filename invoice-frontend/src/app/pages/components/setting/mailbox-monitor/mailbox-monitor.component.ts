import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../map/mode-detect.service';
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success s2-confirm margin-right-cust",
    denyButton: "btn btn-danger s2-confirm",
    cancelButton: "s2-confirm btn btn-gray ml-2",
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});
@Component({
  selector: 'app-mailbox-monitor',
  templateUrl: './mailbox-monitor.component.html',
  styleUrls: ['./mailbox-monitor.component.scss']
})
export class MailboxMonitorComponent implements OnInit {
  mailbpxform: FormGroup;
  compnay_id: any;
  LTS_ACTIVE: any = configdata.LTS_ACTIVE;
  saveIcon = icon.SAVE_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  dtOptions: any = {};
  locallanguage: string;
  Vendor_VendorName: string;
  showTable: boolean = true;
  Vendor_Phone: string;
  Vendor_Email: string;
  imap: string;
  Vendor_Action: string;
  Port: string;
  Vendor_Status: string;
  Vendor_Description: string;
  Vendor_Terms: string;
  Customer_Id: string;
  Time: string;
  Mail_Box_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  yesButton: string = "";
  noButton: string = "";
  editIcon: string;
  archivedIcon: string;
  Listing_Action_Edit: string = "";
  Purchasing_Orders_Delete: string = "";
  mode: any;
  subscription: Subscription;


  addIcon = icon.ADD_MY_SELF_WHITE;
  frequency = configdata.MAILBOX_MONITOR_TIME;
  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, private http: HttpClient, private router: Router, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService) {
    const that = this;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {

      this.archivedIcon = icon.ARCHIVE;
      this.editIcon = icon.EDIT;

    } else {


      this.archivedIcon = icon.ARCHIVE_WHITE;
      this.editIcon = icon.EDIT_WHITE;

    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";

        this.archivedIcon = icon.ARCHIVE;
        this.editIcon = icon.EDIT;

      } else {
        this.mode = "on";


        this.archivedIcon = icon.ARCHIVE_WHITE;
        this.editIcon = icon.EDIT_WHITE;

      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });

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


      that.Vendor_Email = that.translate.instant("Vendor_Email");

      that.Vendor_Action = that.translate.instant("Vendor_Action");

      that.imap = that.translate.instant("IMAP");
      that.Port = that.translate.instant("Port");
      that.Time = that.translate.instant("Time");
      that.Mail_Box_Do_Want_Delete = that.translate.instant(
        "Mail_Box_Do_Want_Delete"
      );
      that.Compnay_Equipment_Delete_Yes = that.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      that.Compnay_Equipment_Delete_No = that.translate.instant(
        "Compnay_Equipment_Delete_No"
      );
      that.Listing_Action_Edit = that.translate.instant("Listing_Action_Edit");
      that.Purchasing_Orders_Delete = that.translate.instant(
        "Purchasing_Orders_Delete"
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
        dataTablesParameters.is_delete = 0;
        that.http.post<DataTablesResponse>(
          configdata.apiurl + httproutes.PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_GET_DATA_TABLE,
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

        $(".button_shiftEditClass").on("click", (event) => {
          // Edit Vendor here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.router.navigate(["/mail-box-form"], {
            queryParams: { _id: data._id },
          });
        });
        $(".button_shiftDeleteClass").on("click", (event) => {
          // Delete Vendor here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.deleteMailBox(data._id);
        });

        $(".call-active-inactive-api").on("click", (event) => {
          //Inactive vendor status  here


        });


      },
    };


  }

  ngOnInit(): void {
  }
  getColumName() {
    let that = this;
    return [
      {
        title: that.Vendor_Email,
        data: "email",
        defaultContent: "",
      },
      {
        title: that.imap,
        data: "imap",
        defaultContent: "",
      },
      {
        title: that.Port,
        data: "port",
        defaultContent: "",
      },
      {
        title: that.Time,
        data: "time",
        defaultContent: "",
      },


      {
        title: that.Vendor_Action,
        render: function (data: any, type: any, full: any) {
          let tmp_tmp = {
            _id: full._id,
          };
          {
            return (
              `
          <div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` +
              JSON.stringify(full) +
              `' aria-hidden="true"></i>
            <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftEditClass" >` + '<img src="' + that.editIcon + '" alt="" height="15px">' + that.Listing_Action_Edit + `</a>
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftDeleteClass" >` + '<img src="' + that.archivedIcon + '" alt="" height="15px">' + that.Purchasing_Orders_Delete + `</a>
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

  // implement delete vendor api call
  deleteMailBox(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Mail_Box_Do_Want_Delete,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.Compnay_Equipment_Delete_Yes,
        denyButtonText: that.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_SETTINGS_MAILBOX_MONITOR_DELETE, { _id: _id })
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
  addMailBox() {
    this.router.navigateByUrl('/mail-box-form');
  }
}
