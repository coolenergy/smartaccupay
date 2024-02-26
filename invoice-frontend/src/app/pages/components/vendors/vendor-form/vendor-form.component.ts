import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { configdata } from "src/environments/configData";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Location } from "@angular/common";
import { HttpCall } from "src/app/service/httpcall.service";
import { httproutes, icon, localstorageconstants, wasabiImagePath } from "src/app/consts";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { UiSpinnerService } from "src/app/service/spinner.service";
import { DomSanitizer } from "@angular/platform-browser";
import { MatDialog } from "@angular/material/dialog";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryAnimation,
  NgxGalleryImageSize,
  NgxGalleryComponent,
} from "ngx-gallery-9";
import { TranslateService } from "@ngx-translate/core";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import { commonFileChangeEvent, commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer, gallery_options } from "src/app/service/utils";

import Swal from "sweetalert2";
import { ModeDetectService } from "../../map/mode-detect.service";
import mapboxgl from "mapbox-gl";

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
  selector: 'app-vendor-form',
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent implements OnInit {
  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  imageError: string;
  cardImageBase64: string;
  filepath: any;
  isImageSaved: boolean;
  vendorImage$: Observable<any>;
  newLat: any;
  newLan: any;
  center: any;
  materialTypeList: any;
  packagingList: any;
  projectListing: any;
  _id: string;
  vendorinfo: FormGroup;
  vendorData: any;
  isheader: boolean = true;
  VENDORSTATUS: any = configdata.superAdminStatus;
  vendor_image_url = "./assets/img/vendor.png";
  files_old: any = [];
  last_files_array: any = [];
  map_flag: boolean = true;
  Add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  // termList = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  Compnay_Vendor_Form_Submitting: string = "";
  saveIcon = icon.SAVE_WHITE;
  backIcon: string;
  subscription: Subscription;
  copyDataFromProject: string = "";
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  add_my_self_Icon = icon.ADD_MY_SELF_WHITE;
  FILE_NOT_SUPPORTED: string;
  exitIcon: string;
  close_this_window: string = "";
  All_popup_Cancel = "";
  All_Save_Exit = "";
  Dont_Save = "";
  Company_vendor_Form_Submitting = "";
  variablestermList: any = [];
  termList: any = this.variablestermList.slice();

  constructor (private modeService: ModeDetectService,
    public dialog: MatDialog,
    private sanitiser: DomSanitizer,
    private location: Location,
    public spinner: UiSpinnerService,
    private formBuilder: FormBuilder,
    public uiSpinner: UiSpinnerService,
    private router: Router,
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    public route: ActivatedRoute,
    public translate: TranslateService) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    this.translate.use(locallanguage);
    this.translate.stream([""]).subscribe((textarray) => {
      this.Compnay_Vendor_Form_Submitting = this.translate.instant("Compnay_Vendor_Form_Submitting");
    });
    this._id = this.route.snapshot.queryParamMap.get("_id");
    if (this._id != null) {
      this.isheader = false;
      this.getOneVendor(this._id);
    }

    this.vendorinfo = this.formBuilder.group({
      vendor_name: ["", Validators.required],
      vendor_phone: ["", Validators.required],
      vendor_email: ["", [Validators.required, Validators.email]],
      gl_account: [""],
      vendor_address: ["", Validators.required],
      vendor_city: ["", Validators.required],
      vendor_address2: [""],
      vendor_state: ["", Validators.required],
      vendor_zipcode: ["", Validators.required],
      vendor_terms: ["", Validators.required],
      vendor_status: ["", Validators.required],
      vendor_country: [""],
      vendor_description: [""],
      vendor_attachment: [""],
      vendor_id: [""],
      customer_id: [""],
      password: [""],
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });
    let that = this;
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.FILE_NOT_SUPPORTED = this.translate.instant("FILE_NOT_SUPPORTED");
      this.close_this_window = this.translate.instant("close_this_window");
      this.All_popup_Cancel = this.translate.instant("All_popup_Cancel");
      this.All_Save_Exit = this.translate.instant("All_Save_Exit");
      this.Dont_Save = this.translate.instant("Dont_Save");
      this.Company_vendor_Form_Submitting = this.translate.instant("Company_vendor_Form_Submitting");
    });
  }

  ngAfterViewInit(): void {
    mapboxgl!.accessToken = configdata.MAPBOXAPIKEY;
    var geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      types: "address",
    });
    geocoder.addTo("#geocoder-container");

    let that = this;
    geocoder.on("result", function (params) {
      that.vendorinfo.get("vendor_address").setValue("");
      that.vendorinfo.get("vendor_zipcode").setValue("");
      that.vendorinfo.get("vendor_city").setValue("");
      that.vendorinfo.get("vendor_state").setValue("");
      that.vendorinfo.get("vendor_country").setValue("");


      params.result.context.forEach((element, index) => {
        if (typeof params.result.context[index] !== "undefined") {
          if (params.result["properties"]["address"] !== -1) {
            that.vendorinfo.get("vendor_address").setValue(params.result["properties"]["address"]);
          }
          if (params.result["text"] !== -1) {
            that.vendorinfo.get("vendor_address").setValue(params.result["text"]);
          }
          if (params.result.context[index].id.indexOf("postcode") !== -1) {
            that.vendorinfo.get("vendor_zipcode").setValue(params.result.context[index].text);
          }
          if (params.result.context[index].id.indexOf("place") !== -1) {
            that.vendorinfo.get("vendor_city").setValue(params.result.context[index].text);
          }
          if (params.result.context[index].id.indexOf("region") !== -1) {
            that.vendorinfo.get("vendor_state").setValue(params.result.context[index].text);
          }
          if (params.result.context[index].id.indexOf("country") !== -1) {
            that.vendorinfo.get("vendor_country").setValue(params.result.context[index].text);
          }
        }
      });
    });
  }

  ngOnInit(): void {

    this.getAllTerms();
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
  }

  /*
   Open map
   Mapbox map is open for selected lat/lng
 */
  // openmap() {
  //   let that = this;
  //   let reqObject = that.vendorinfo.value;
  //   if (reqObject.location_lat != undefined && reqObject.location_lng != undefined)
  //   {
  //     if (reqObject.location_lat != 0.0 && reqObject.location_lng != 0.0)
  //     {
  //       localStorage.setItem("mapData", JSON.stringify(reqObject))
  //       this.map_flag = false;
  //       this.router.navigate(['/map'], { queryParams: { user_lat: reqObject.location_lat, user_lng: reqObject.location_lng, address: this.addressFormate(reqObject), street: reqObject.location_name, backHide: "false" } });
  //     }
  //   }
  // }

  confirmexit() {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.close_this_window,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.All_Save_Exit,
        cancelButtonText: this.Dont_Save,
        denyButtonText: this.All_popup_Cancel,
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {

          if (this.vendorinfo.valid) {
            this.saveVendorData();
          } else {
            that.snackbarservice.openSnackBar(this.Company_vendor_Form_Submitting, "error");
          }
        } else if (result.isDenied) {
        } else {
          setTimeout(() => {
            that.router.navigate(["/vendors"]);
          }, 100);
        }
      });
  }

  /*
   Prepare address formatting here
 */
  addressFormate(address: any) {
    let addressStr = "";
    if (address.location_street1 && address.location_street1 !== "") {
      addressStr = address.location_street1 + ", ";
    }
    if (address.location_street2 && address.location_street2 !== "") {
      addressStr = addressStr + address.location_street1 + ", ";
    }
    if (address.location_city && address.location_city !== "") {
      addressStr = addressStr + address.location_city + ", ";
    }
    if (address.location_state && address.location_state !== "") {
      addressStr = addressStr + address.location_state + ", ";
    }
    if (address.location_postcode && address.location_postcode !== "") {
      addressStr = addressStr + address.location_postcode + ", ";
    }
    if (address.location_country && address.location_country !== "") {
      addressStr = addressStr + address.location_country;
    }
    return addressStr;
  }


  /*
     GET COST CODE - Item Modules cost code fetched and dropdown prepare for it.
     Only Item Cost code will be list here, since we have to bind the only Item costcode.
     Cost code is based on modules and We can find it on Settings section.
     We need to add first cost code inside the settings for Items module.
     Cost code is non-mandatory field so user can skip to add it for Item. 
 */


  getAllTerms() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.OTHER_TERM_GET)
      .subscribe(function (params: any) {
        if (params.status) {
          that.variablestermList = params.data;
          that.termList = that.variablestermList.slice();
        }
      });
  }
  /*
    SAVE VENDOR - ADD/EDIT VENDOR HERE
    If '_id' is not null then it will consider for edit 
    If '_id' is not in the request object then item will be add
*/
  async saveVendorData() {
    let that = this;
    let req_temp = that.vendorinfo.value;
    var isVendorfromQBO = false; // connection status of QBO
    var is_quickbooks = false;

    if (this.vendorinfo.valid) {
      let reqObject = {
        _id: "",
        vendor_name: req_temp.vendor_name,
        vendor_phone: req_temp.vendor_phone,
        vendor_email: req_temp.vendor_email,
        gl_account: req_temp.gl_account,
        vendor_address: req_temp.vendor_address,
        vendor_city: req_temp.vendor_city,
        vendor_address2: req_temp.vendor_address2,
        vendor_state: req_temp.vendor_state,
        vendor_zipcode: req_temp.vendor_zipcode,
        vendor_country: req_temp.vendor_country,
        vendor_terms: req_temp.vendor_terms,
        vendor_description: req_temp.vendor_description,
        vendor_status: req_temp.vendor_status,
        vendor_attachment: "",
        vendor_id: req_temp.vendor_id,
        customer_id: req_temp.customer_id,
        isVendorfromQBO: isVendorfromQBO,
        is_quickbooks: is_quickbooks,
      };

      this.httpCall.httpPostCall(httproutes.QUICKBOOK_ISCONNECT, { data: "request" }).subscribe(function (params) { //check the status of connection with QBO
        if (params.isConnect === true) {
          reqObject.isVendorfromQBO = true;
          reqObject.is_quickbooks = true;
        } else {
          delete reqObject.isVendorfromQBO;
          delete reqObject.is_quickbooks;
        }
      });

      if (this._id != null) {
        that.uiSpinner.spin$.next(true);
        const formData_profle = new FormData();
        formData_profle.append("file", this.filepath);
        formData_profle.append("folder_name", wasabiImagePath.VENDOR_ATTECHMENT);
        that.httpCall
          .httpPostCall(
            httproutes.PORTAL_COMMON_COMPANY_SAVE_PROFILE,
            formData_profle
          ).subscribe(function (profile_data: any) {
            if (profile_data.status) {
              if (that.filepath != undefined) {
                reqObject["vendor_image"] = profile_data.data;
              }
              const formData = new FormData();
              for (var i = 0; i < that.files.length; i++) {
                formData.append("file[]", that.files[i]);
              }
              formData.append("folder_name", wasabiImagePath.VENDOR_ATTECHMENT);
              that.httpCall
                .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
                .subscribe(function (params) {
                  reqObject.vendor_attachment = params.data.concat(
                    that.last_files_array
                  );
                  reqObject._id = that._id;

                  that.httpCall
                    .httpPostCall(
                      httproutes.INVOICE_SAVE_VENDOR_FORM,
                      reqObject
                    )
                    .subscribe(function (params_new) {
                      if (params_new.status) {
                        that.uiSpinner.spin$.next(false);
                        that.snackbarservice.openSnackBar(params_new.message, "success");
                        that.location.back();
                      } else {
                        that.uiSpinner.spin$.next(false);
                        that.snackbarservice.openSnackBar(params_new.message, "error");
                      }
                    });
                });
            } else {
              that.uiSpinner.spin$.next(false);
              that.snackbarservice.openSnackBar(profile_data.message, "error");
            }
          });
      } else {
        that.uiSpinner.spin$.next(true);
        const formData = new FormData();
        const formData_profle = new FormData();
        formData_profle.append("file", this.filepath);
        formData_profle.append("folder_name", wasabiImagePath.VENDOR_ATTECHMENT);
        that.httpCall
          .httpPostCall(
            httproutes.PORTAL_COMMON_COMPANY_SAVE_PROFILE,
            formData_profle
          )
          .subscribe(function (profile_data: any) {
            if (profile_data.status) {
              if (that.filepath != undefined) {
                reqObject["vendor_image"] = profile_data.data;
              }
              for (var i = 0; i < that.files.length; i++) {
                formData.append("file[]", that.files[i]);
              }
              formData.append("folder_name", wasabiImagePath.VENDOR_ATTECHMENT);
              that.httpCall
                .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
                .subscribe(function (params) {
                  delete reqObject["_id"];
                  reqObject.vendor_attachment = params.data;

                  that.httpCall
                    .httpPostCall(
                      httproutes.INVOICE_SAVE_VENDOR_FORM,
                      reqObject
                    )
                    .subscribe(function (params_new) {
                      if (params_new.status) {
                        that.uiSpinner.spin$.next(false);
                        that.snackbarservice.openSnackBar(params_new.message, "success");
                        that.location.back();
                      } else {
                        that.uiSpinner.spin$.next(false);
                        that.snackbarservice.openSnackBar(params_new.message, "error");
                      }
                    });
                });
            } else {
              that.uiSpinner.spin$.next(false);
              that.snackbarservice.openSnackBar(profile_data.message, "error");
            }
          });
      }
    } else {
      that.snackbarservice.openSnackBar(this.Compnay_Vendor_Form_Submitting, "error");
    }
  }

  /*
      GET ONE VENDOR BASED ON ID - USE IT FOR EDIT VENDOR
  */
  getOneVendor(_id): void {
    let that = this;
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_VENDOR, { _id: _id })
      .subscribe(function (params) {
        if (params.status) {
          that.vendorData = params.data;
          if (that.vendorData.vendor_image != "" && that.vendorData.vendor_image != undefined) {
            that.vendor_image_url = that.vendorData.vendor_image;
          }
          that.files_old = [];
          for (let loop_i = 0; loop_i < params.data.vendor_attachment.length; loop_i++) {
            that.files_old.push(params.data.vendor_attachment[loop_i]);
          }
          that.last_files_array = params.data.vendor_attachment;
          that.vendorinfo = that.formBuilder.group({
            vendor_name: [that.vendorData.vendor_name, Validators.required],
            vendor_phone: [that.vendorData.vendor_phone, Validators.required],
            vendor_email: [that.vendorData.vendor_email, [Validators.required, Validators.email],],
            gl_account: [that.vendorData.gl_account],
            vendor_address: [that.vendorData.vendor_address, Validators.required,],
            vendor_city: [that.vendorData.vendor_city, Validators.required],
            vendor_address2: [that.vendorData.vendor_address2],
            vendor_state: [that.vendorData.vendor_state, Validators.required],
            vendor_zipcode: [that.vendorData.vendor_zipcode, Validators.required,],
            vendor_terms: [that.vendorData.vendor_terms, Validators.required],
            vendor_status: [that.vendorData.vendor_status, Validators.required],
            vendor_country: [that.vendorData.vendor_country],
            vendor_description: [that.vendorData.vendor_description],
            vendor_id: [that.vendorData.vendor_id],
            customer_id: [that.vendorData.customer_id],
          });
        }
      });
  }

  back(): void {
    this.location.back();
  }

  sendInvitation() {
    // let that = this;
    // let req_temp = that.userpersonalinfo.value;
    // if (req_temp.password == "") {
    //   that.snackbarservice.openSnackBar(that.Empty_Temporary_Password, "error");
    // } else {
    //   that.uiSpinner.spin$.next(true);
    //   let reqObject = {
    //     password: req_temp.password,
    //   };

    //   that.httpCall
    //     .httpPostCall(httproutes.USER_SEND_PASSWORD, reqObject)
    //     .subscribe(function (params_new) {
    //       if (params_new.status) {
    //         that.snackbarservice.openSnackBar(params_new.message, "success");
    //         that.uiSpinner.spin$.next(false);
    //         that.userpersonalinfo.get("password").setValue("");
    //       } else {
    //         that.snackbarservice.openSnackBar(params_new.message, "error");
    //         that.uiSpinner.spin$.next(false);
    //       }
    //     });
    // }

  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  fileChangeEvent(fileInput: any) {
    commonFileChangeEvent(fileInput, "image").then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.snackbarservice.openSnackBar(this.FILE_NOT_SUPPORTED, "error");
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

  imageNetworkPreview(allAttachment, index) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.last_files_array[index];
  }
}



