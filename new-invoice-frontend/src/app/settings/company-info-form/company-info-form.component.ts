import { Component, ViewChild } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NgxGalleryComponent,
  NgxGalleryOptions,
  NgxGalleryImage,
} from 'ngx-gallery-9';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { commonFileChangeEvent } from 'src/app/services/utils';
import { VendorsService } from 'src/app/vendors/vendors.service';
import { WEB_ROUTES } from 'src/consts/routes';
import {
  gallery_options,
  showNotification,
  swalWithBootstrapButtons,
  commonLocalThumbImage,
  commonNetworkThumbImage,
  commonNewtworkAttachmentViewer,
} from 'src/consts/utils';
import { wasabiImagePath } from 'src/consts/wasabiImagePath';
import { SettingsService } from '../settings.service';
import { MatDatepicker } from '@angular/material/datepicker';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { configData } from 'src/environments/configData';
import { HttpCall } from 'src/app/services/httpcall.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { TranslateService } from '@ngx-translate/core';
import { CountryModel, TermModel } from '../settings.model';
import { sweetAlert } from 'src/consts/sweet_alert';

@Component({
  selector: 'app-company-info-form',
  templateUrl: './company-info-form.component.html',
  styleUrls: ['./company-info-form.component.scss'],
})
export class CompanyInfoFormComponent {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  companyinfoForm!: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: any = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id = '';
  companyLogo: any;
  imageError: any;
  isImageSaved: any;
  defalut_image = '../assets/images/placeholder_logo.png';
  cardImageBase64: any;
  files_old: string[] = [];
  last_files_array: string[] = [];
  files: File[] = [];
  @ViewChild('gallery') gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;
  filepath: any;
  variablesCompnayTypes_data: any = [];
  CompnayTypes_data: any = this.variablesCompnayTypes_data.slice();

  variablesCSIDivisions: any = [];
  csiDivisions: any = this.variablesCSIDivisions.slice();

  // CompnaySizes_data: any;
  variablesCompnaySizes_data: any = [];
  CompnaySizes_data: any = this.variablesCompnaySizes_data.slice();

  range: any = [];
  year: number = new Date().getFullYear();
  selectedVendorType = '';
  compnay_code: any;
  compnay_id: any;

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public route: ActivatedRoute,
    private sanitiser: DomSanitizer,
    public httpCall: HttpCall,
    // public commonService: CommonService,
    public SettingsServices: SettingsService,
    public translate: TranslateService
  ) {
    this.getCompanyType();
    this.getCompanyNigp();
    this.getCompanySize();
    this.getOneVendor();
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.companyinfoForm = this.fb.group({
      companyname: ['', [Validators.required]],
      companycode: ['', [Validators.required]],
      companyemail: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      companywebsite: ['', [Validators.required]],
      companyphone: [''],
      companyphone2: [''],
      companyaddress: ['', [Validators.required]],
      companysize: [''],
      companyaddresscity: ['', [Validators.required]],
      companyaddressstate: ['', [Validators.required]],
      companyaddresszip: ['', [Validators.required]],
      vendor_country: ['USA'],
      companydivision: ['', [Validators.required]],
      companyactivesince: ['', [Validators.required]],
      companytype: [''],
    });
    for (let i = 0; i < 100; i++) {
      this.range.push(this.year - i);
    }
    this.tmp_gallery = gallery_options();
    this.tmp_gallery.actions = [
      {
        icon: 'fas fa-download',
        onClick: this.downloadButtonPress.bind(this),
        titleText: 'download',
      },
    ];
    this.galleryOptions = [this.tmp_gallery];

    // this.getTerms();
    if (this.id) {
      this.getOneVendor();
    }
  }
  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  chosenYearHandler(normalizedYear: any, datepicker: MatDatepicker<any>) {
    this.companyinfoForm.get('companyactivesince')!.setValue(normalizedYear);
    datepicker.close();
  }

  async getOneVendor() {
    let that = this;
    const data = await this.SettingsServices.getCompanyInfo();
    if (data.status) {
      const CompanyInfoData = data.data;
      that.compnay_code = CompanyInfoData.companycode;
      that.compnay_id = CompanyInfoData._id;
      if (
        CompanyInfoData.companylogo == undefined ||
        CompanyInfoData.companylogo == null ||
        CompanyInfoData.companylogo == ''
      ) {
        that.companyLogo = '../assets/images/placeholder_logo.png';
      } else {
        that.companyLogo = CompanyInfoData.companylogo;
      }
      this.companyinfoForm = this.fb.group({
        companyname: [CompanyInfoData.companyname, Validators.required],
        companywebsite: [CompanyInfoData.companywebsite],
        companycode: [{ value: CompanyInfoData.companycode, disabled: true }],
        companyphone: [CompanyInfoData.companyphone, [Validators.required]],
        companyemail: [
          CompanyInfoData.companyemail,
          [Validators.email, Validators.required],
        ],
        companyphone2: [CompanyInfoData.companyphone2],
        companyactivesince: [
          { value: CompanyInfoData.companyactivesince, disabled: true },
        ],
        companydivision: [CompanyInfoData.companydivision],
        companysize: [CompanyInfoData.companysize],
        companytype: [CompanyInfoData.companytype],
        companyaddress: [CompanyInfoData.companyaddress],
        companyaddresscity: [CompanyInfoData.companyaddresscity],
        companyaddressstate: [CompanyInfoData.companyaddressstate],
        companyaddresszip: [CompanyInfoData.companyaddresszip],
      });
      const found = that.CompnayTypes_data.find((element: any) => element._id == CompanyInfoData.companytype);
      if (found) {
        that.selectedVendorType = found.name
          ? found.name
          : configData.PRIME_VENDOR_TYPE;
      }
      that.getCISDivision(that.selectedVendorType == configData.PRIME_VENDOR_TYPE);
    }

    // async getTerms() {
    //   const data = await this.vendorService.getTerms();
    //   if (data.status) {
    //     this.variablestermList = data.data;
    //     this.termsList = this.variablestermList.slice();
    //   }
  }

  async saveVendor() {
    let that = this;
    if (this.companyinfoForm.valid) {
      let requestObject = this.companyinfoForm.value;
      const formData = new FormData();
      formData.append('file', this.filepath);
      formData.append('reqObject', JSON.stringify(requestObject));
      formData.append('editcopmanycode', this.compnay_code);
      formData.append('_id', this.compnay_id);
      this.uiSpinner.spin$.next(true);
      requestObject = formData;
      const data = await this.SettingsServices.saveCompanyInfo(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  async getCompanyType() {
    const data = await this.SettingsServices.getCompanyType();
    if (data.status) {
      this.variablesCompnayTypes_data = data.data;
      this.CompnayTypes_data = this.variablesCompnayTypes_data.slice();
    }
  }

  async getCompanyNigp() {
    const data = await this.SettingsServices.getCompanyNigp();
    if (data.status) {
      this.variablesCSIDivisions = data.data;
      this.csiDivisions = this.variablesCSIDivisions.slice();
    }
  }

  async getCompanySize() {
    const data = await this.SettingsServices.getCompanySize();
    if (data.status) {
      this.variablesCompnaySizes_data = data.data;
      this.CompnaySizes_data = this.variablesCompnaySizes_data.slice();
    }
  }

  onVendorTypeSelect(event: any) {
    const found = this.CompnayTypes_data.find((element: any) => element._id == event);
    this.selectedVendorType = found.name
      ? found.name
      : configData.PRIME_VENDOR_TYPE;
    this.companyinfoForm.get('companydivision')?.setValue([]);
    this.getCISDivision(
      this.selectedVendorType == configData.PRIME_VENDOR_TYPE
    );
  }

  async getCISDivision(isPrimeVendor: any) {
    let url = '';
    if (isPrimeVendor) {
      url = httpversion.V1 + httproutes.PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED;
    } else {
      url = httpversion.V1 + httproutes.PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED;
    }
    const data = await this.httpCall.httpGetCall(url).toPromise();
    if (data.status) {
      this.variablesCSIDivisions = data.data;
      this.csiDivisions = this.variablesCSIDivisions.slice();
    }
  }

  confirmExit() {
    swalWithBootstrapButtons
      .fire({
        title:
          this.translate.instant('DOCUMENT.CONFIRMATION_DIALOG.SAVING'),
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.SAVE_EXIT'),
        cancelButtonText: this.translate.instant('COMMON.ACTIONS.DONT_SAVE'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.CANCEL'),
        allowOutsideClick: false,
        background: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_BACKGROUND : sweetAlert.WHITE_BACKGROUND,
        color: localStorage.getItem(localstorageconstants.DARKMODE) === 'dark' ? sweetAlert.DARK_COLOR : sweetAlert.WHITE_COLOR,
      })
      .then((result) => {
        if (result.isConfirmed) {
          // Move to the vendor listing
          if (this.companyinfoForm.valid) {
            this.saveVendor();
          } else {
            // alert form invalidation
            showNotification(
              this.snackBar,
              'Please complete the company inforamtion form before submitting.',
              'error'
            );
          }
        } else if (result.isDenied) {
          // ;
        } else {
          setTimeout(() => {
            this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
          }, 100);
        }
      });
  }

  filechangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.imageError = result.message;
        showNotification(this.snackBar, result.message, 'success');
      }
    });
  }

  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }
  fileChange(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList = element.files;
    if (fileList) {
      this.prepareFilesList(fileList);
    }
  }
  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
  }

  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    this.last_files_array.splice(index, 1);
    this.files_old.splice(index, 1);
  }

  prepareFilesList(files: any) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  // View Thumbnail of Location attachment
  thumbImage(file: File) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  // View Thumbnail of Network Attachment
  thumbNetworkImage(index: number) {
    return commonNetworkThumbImage(this.last_files_array[index]);
  }

  imageNetworkPreview(allAttachment: Array<string>, index: number) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }

  downloadButtonPress(event: any, index: number): void {
    window.location.href = this.imageObject[index];
  }
}
