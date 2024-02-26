import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpCall } from "src/app/service/httpcall.service";
import { httproutes, icon, localstorageconstants } from "src/app/consts";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import { Mostusedservice } from "src/app/service/mostused.service";
import { MatDatepicker } from "@angular/material/datepicker";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import * as _moment from "moment";
// tslint:disable-next-line:no-duplicate-imports
import * as _rollupMoment from "moment";
import { TranslateService } from "@ngx-translate/core";
import { UiSpinnerService } from "src/app/service/spinner.service";
import { Location } from "@angular/common";
import { configdata } from "src/environments/configData";
import { commonFileChangeEvent } from "src/app/service/utils";

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: "YYYY",
  },
  display: {
    dateInput: "YYYY",
    monthYearLabel: "YYYY",
  },
};

@Component({
  selector: "app-settings-companyinfo",
  templateUrl: "./settings-companyinfo.component.html",
  styleUrls: ["./settings-companyinfo.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class SettingsCompanyinfoComponent implements OnInit {
  compnayinfo: FormGroup;
  compnay_code: any;
  compnay_id: any;
  company_logo: any;
  imageError: any;
  isImageSaved: any;
  defalut_image: string = "../assets/images/placeholder_logo.png";
  cardImageBase64: any;
  filepath: any;

  maxDate: any;
  // CompnaySizes_data: any;
  variablesCompnaySizes_data: any = [];
  CompnaySizes_data: any = this.variablesCompnaySizes_data.slice();
  // CompnayTypes_data: any;
  variablesCompnayTypes_data: any = [];
  CompnayTypes_data: any = this.variablesCompnayTypes_data.slice();

  FILE_NOT_SUPPORTED: any;
  saveIcon = icon.SAVE_WHITE;
  variablesCSIDivisions: any = [];
  csiDivisions: any = this.variablesCSIDivisions.slice();

  selectedVendorType = "";
  year: number = new Date().getFullYear();
  range: any = [];

  constructor(
    private location: Location,
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    public translate: TranslateService,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice
  ) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.FILE_NOT_SUPPORTED = this.translate.instant("FILE_NOT_SUPPORTED");
    });
    this.AdminCompnayTypes();
    this.AdminCompnaySizes();
    this.compnayinfo = this.formBuilder.group({
      companyname: ["", Validators.required],
      companywebsite: [""],
      companycode: [{ value: "", disabled: true }],
      companyphone: ["", [Validators.required]],
      companyemail: ["", [Validators.email, Validators.required]],
      companyphone2: [""],
      companyactivesince: [""],
      companydivision: [""],
      companysize: ["", Validators.pattern("^[0-9]*$")],
      companytype: [""],
      companyaddress: [""],
      companyaddresscity: [""],
      companyaddressstate: [""],
      companyaddresszip: [""],
    });
    for (var i = 0; i < 100; i++) {
      this.range.push(this.year - i);
    }
  }

  @ViewChild("OpenFilebox") OpenFilebox: any = [];

  ngOnInit(): void {
    this.maxDate = new Date();
    let that = this;
    let userData = JSON.parse(
      localStorage.getItem(localstorageconstants.USERDATA)!
    );
  }

  back() {
    this.location.back();
  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>) {
    this.compnayinfo.get("companyactivesince")!.setValue(normalizedYear);
    datepicker.close();
  }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, "image").then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.imageError = result.message;
        this.snackbarservice.openSnackBar(result.message, "error");
      }
    });
    /* this.imageError = null; 
    if (fileInput.target.files && fileInput.target.files[0]) { 
      // Size Filter Bytes
      const max_size = 20971520;
      const allowed_types = ['image/png', 'image/jpeg'];
      const max_height = 15200;
      const max_width = 25600;
      this.filepath = fileInput.target.files[0];
      let file_name_tmp = this.filepath.name;
      let file_arrya = file_name_tmp.split(".");
      let file_extention = file_arrya[file_arrya.length - 1]; 
      if (this.filepath.type == "image/webp" || this.filepath.type == "image/WEBP" || file_extention.toLowerCase() == "webp") {
        this.snackbarservice.openSnackBar(this.FILE_NOT_SUPPORTED, "error");
      } else {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const image = new Image();
          image.src = e.target.result;
          image.onload = rs => {
            const img_height = rs.currentTarget['height'];
            const img_width = rs.currentTarget['width']; 
            if (img_height > max_height && img_width > max_width) {
              this.imageError =
                'Maximum dimentions allowed ' +
                max_height +
                '*' +
                max_width +
                'px';
              return false;
            }
            else {
              const imgBase64Path = e.target.result;
              this.cardImageBase64 = imgBase64Path;
              this.isImageSaved = true;
            }
          };
        };
        reader.readAsDataURL(fileInput.target.files[0]);
      }
    } */
  }

  AdminCompnayTypes() {
    let self = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_SPONSOR_GET_COMPNAY_TYPE)
      .subscribe(function (params: any) {
        if (params.status) {
          // self.CompnayTypes_data = params.data;
          self.variablesCompnayTypes_data = params.data;
          self.CompnayTypes_data = self.variablesCompnayTypes_data.slice();
        }
        self.getCompanyInfo();
      });
  }

  AdminCompnaySizes() {
    let self = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_SPONSOR_GET_COMPNAY_SIZE)
      .subscribe(function (params: any) {
        if (params.status) {
          // self.CompnaySizes_data = params.data;
          self.variablesCompnaySizes_data = params.data;
          self.CompnaySizes_data = self.variablesCompnaySizes_data.slice();
        }
      });
  }

  getCompanyInfo() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.COMPNAY_INFO_OTHER_SETTING_GET)
      .subscribe(function (params) {
        if (params.status) {
          that.compnay_code = params.data.companycode;
          that.compnay_id = params.data._id;
          if (
            params.data.companylogo == undefined ||
            params.data.companylogo == null ||
            params.data.companylogo == ""
          ) {
            that.company_logo = "../assets/images/placeholder_logo.png";
          } else {
            that.company_logo = params.data.companylogo;
          }

          that.compnayinfo = that.formBuilder.group({
            companyname: [params.data.companyname, Validators.required],
            companywebsite: [params.data.companywebsite],
            companycode: [{ value: params.data.companycode, disabled: true }],
            companyphone: [params.data.companyphone, [Validators.required]],
            companyemail: [
              params.data.companyemail,
              [Validators.email, Validators.required],
            ],
            companyphone2: [params.data.companyphone2],
            companyactivesince: [params.data.companyactivesince],
            companydivision: [params.data.companydivision],
            companysize: [params.data.companysize],
            companytype: [params.data.companytype],
            companyaddress: [params.data.companyaddress],
            companyaddresscity: [params.data.companyaddresscity],
            companyaddressstate: [params.data.companyaddressstate],
            companyaddresszip: [params.data.companyaddresszip],
          });
          let found = that.CompnayTypes_data.find(
            (element: any) => element._id == params.data.companytype
          );
          that.selectedVendorType = found.name
            ? found.name
            : configdata.PRIME_VENDOR_TYPE;
          that.getCISDivision(
            that.selectedVendorType == configdata.PRIME_VENDOR_TYPE
          );
        }
      });
  }

  /* AdminCSIDivisionWorkPerformed() {
    let self = this;
    self.httpCall.httpGetCall(httproutes.PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED).subscribe(function (params: any) {
      if (params.status) {
        self.variablesCSIDivisions = params.data;
        self.csiDivisions = self.variablesCSIDivisions.slice();
      }
    });
  } */
  onVendorTypeSelect(event: any) {
    let found = this.CompnayTypes_data.find(
      (element: any) => element._id == event
    );
    this.selectedVendorType = found.name
      ? found.name
      : configdata.PRIME_VENDOR_TYPE;
    this.compnayinfo.get("companydivision")!.setValue([]);
    this.getCISDivision(
      this.selectedVendorType == configdata.PRIME_VENDOR_TYPE
    );
  }

  async getCISDivision(isPrimeVendor: any) {
    let url = "";
    if (isPrimeVendor) {
      url = httproutes.PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED;
    } else {
      url = httproutes.PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED;
    }
    let data = await this.httpCall.httpGetCall(url).toPromise();
    if (data.status) {
      this.variablesCSIDivisions = data.data;
      this.csiDivisions = this.variablesCSIDivisions.slice();
    }
  }

  saveData() {
    let that = this;
    if (this.compnayinfo.valid) {
      let reqObject = this.compnayinfo.value;
      let userData = JSON.parse(
        localStorage.getItem(localstorageconstants.USERDATA)!
      );
      const formData = new FormData();
      formData.append("file", this.filepath);
      formData.append("reqObject", JSON.stringify(reqObject));
      formData.append("editcopmanycode", this.compnay_code);
      formData.append("_id", this.compnay_id);
      this.uiSpinner.spin$.next(true);
      this.httpCall
        .httpPostCall(httproutes.COMPNAY_INFO_OTHER_SETTING_UPDATE, formData)
        .subscribe(function (params) {
          that.uiSpinner.spin$.next(false);
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.httpCall
              .httpGetCall(httproutes.COMPNAY_INFO_OTHER_SETTING_GET)
              .subscribe(function (compnayData: any) {
                if (compnayData.status) {
                  userData.companydata = compnayData.data;
                  localStorage.setItem(
                    localstorageconstants.USERDATA,
                    JSON.stringify(userData)
                  );
                  that.mostusedservice.userupdatecompnayEmit();
                }
              });
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
    }
  }
}
