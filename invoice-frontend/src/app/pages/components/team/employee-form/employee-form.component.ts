import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { configdata } from 'src/environments/configData';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Location } from '@angular/common';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../map/mode-detect.service';
import { amountChange, commonFileChangeEvent } from 'src/app/service/utils';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});
@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false }
  }]
})
export class EmployeeFormComponent implements OnInit {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  imageError: any;
  isImageSaved: boolean = false;
  cardImageBase64: any;
  filepath: any;
  value: any;
  db_roles: any = [];
  //db_jobtitle
  variablesdb_jobtitle: any = [];
  db_jobtitle: any = this.variablesdb_jobtitle.slice();
  //db_jobtype
  variablesdb_jobtype: any = [];
  db_jobtype: any = this.variablesdb_jobtype.slice();
  db_payroll_group: any = [];
  db_Doc_types: any = [];

  //db_Departmaents
  variablesdb_Departmaents: any = [];
  db_Departmaents: any = this.variablesdb_Departmaents.slice();

  //db_manager_users
  variablesdb_manager_users: any = [];
  db_manager_users: any = this.variablesdb_manager_users.slice();

  //db_supervisor_users
  variablesdb_supervisor_users: any = [];
  db_supervisor_users: any = this.variablesdb_supervisor_users.slice();

  //db_locations
  variablesdb_locations: any = [];
  db_locations: any = this.variablesdb_locations.slice();
  db_costcodes: any = [];
  firstParam: any = "";
  doc_controller: number = 0;
  public statuss: any = configdata.superAdminStatus;
  public gender_array: any = configdata.gender;
  public payroll_cycles: any = configdata.payroll_cycle;
  public credit_card_types: any = [];
  document_array: any = Array(Array());
  userpersonalinfo: any;
  usercontactinfo: any;
  useremployeeinfo: any;
  usersendinvitation: any;
  maxDate = new Date();
  Employee: any = configdata.TEAM;
  showHideExpiration: any = [];
  login_from: any = configdata.LOGIN_FROM;
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  YOU_WANT_TO_ADD_SCHEDULE: string = "";
  locationList = [];
  shiftList = [];
  variableslanguageList: any = [];
  languageList: any = this.variableslanguageList.slice();
  subscription: Subscription;
  mode: any;
  backIcon: string;
  nextIcon: string;
  saveIcon = icon.SAVE_WHITE;
  employeeicon = icon.EMPLOYEE_INF0;
  employeewhite = icon.EMPLOYEE_INFO_WHITE;
  contacticon = icon.CONTACT_INFO;
  contactwhiteicon = icon.CONTACT_INFO_WHITE;
  personalicon = icon.PERSONAL_INFO;
  personalwhiteicon = icon.PERSONAL_INFO_WHITE;
  close_this_window: string = "";
  Empty_Temporary_Password: string = "";

  defalut_image: string = icon.MALE_PLACEHOLDER;
  defalut_female_mage: string = icon.FEMALE_PLACEHOLDER;
  exitIcon: string;
  sample_img = '/assets/images/image-gallery/logo.png';

  constructor(private location: Location, private modeService: ModeDetectService, public mostusedservice: Mostusedservice, private formBuilder: FormBuilder,
    public spinner: UiSpinnerService, public employeeservice: EmployeeService, public snackbarservice: Snackbarservice,
    private router: Router, public httpCall: HttpCall, public translate: TranslateService, public dialog: MatDialog,) {
    let that = this;
    this.translate.stream(['']).subscribe((textarray) => {
      that.Compnay_Equipment_Delete_Yes = that.translate.instant('Compnay_Equipment_Delete_Yes');
      that.Compnay_Equipment_Delete_No = that.translate.instant('Compnay_Equipment_Delete_No');
      that.YOU_WANT_TO_ADD_SCHEDULE = that.translate.instant("YOU_WANT_TO_ADD_SCHEDULE");
      that.close_this_window = that.translate.instant("close_this_window");
      this.Empty_Temporary_Password = this.translate.instant("Empty_Temporary_Password");
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
      this.nextIcon = icon.NEXT_WHITE;
      this.exitIcon = icon.CANCLE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.nextIcon = icon.NEXT_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
        this.nextIcon = icon.NEXT_WHITE;
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
        this.nextIcon = icon.NEXT_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });

  }

  back(): void {
    this.location.back();
  }

  amountChange(params: any) {
    let self = this;
    self.useremployeeinfo.get("usersalary").setValue(amountChange(params));
    // params = params.target.value;
    // if (params == "") {
    //   self.useremployeeinfo.get("usersalary").setValue("00.00");
    // } else {
    //   if (params.match(numbers)) {
    //     var numbers = /^[0-9]+$/;
    //     let dotIndex = params.indexOf(".");

    //     let count = params.substring(dotIndex + 1).length;

    //     let multiply;
    //     if (count == 1) {
    //       multiply = 10;
    //     } else {
    //       multiply = 1000;
    //     }
    //     var temp = (Number(params) * multiply) / 100;
    //     self.useremployeeinfo.get("usersalary").setValue(temp.toFixed(2));
    //   }

    // }
  }

  getAllCostCode() {
    let that = this;
    that.httpCall.httpPostCall(httproutes.PORTAL_COMPANY_COSTCODE_GET,
      { module: that.Employee }).subscribe(function (params) {
        if (params.status) {
          that.db_costcodes = params.data;
        }
      });
  }

  getAllCreditCard() {
    let that = this;
    that.httpCall.httpGetCall(httproutes.OTHER_SETTING_CREDIT_CARD_GET).subscribe(function (params) {
      if (params.status) {
        that.credit_card_types = params.data;
        that.useremployeeinfo.get('card_type').setValue(that.credit_card_types[0]._id);
      }
    });
  }


  ngOnInit(): void {
    let that = this;
    this.maxDate.setDate(this.maxDate.getDate() - 5114);

    this.mostusedservice.getAllRoles().subscribe(function (data) {
      if (data.status) {
        that.db_roles = data.data;
        that.db_roles.forEach((element: any) => {
        });
        var reqObject = {};
        that.mostusedservice.getSpecificUsers(reqObject).subscribe(function (user_data) {
          if (user_data.status) {
            // that.db_manager_users = user_data.data;
            that.variablesdb_manager_users = user_data.data;
            that.db_manager_users = that.variablesdb_manager_users.slice();
            // that.db_supervisor_users = user_data.data;
            that.variablesdb_supervisor_users = user_data.data;
            that.db_supervisor_users = that.variablesdb_supervisor_users.slice();
          }
        });
      }
    });

    this.mostusedservice.getAlljobtitle().subscribe(function (data) {
      if (data.status) {
        // that.db_jobtitle = data.data;
        that.variablesdb_jobtitle = data.data;
        that.db_jobtitle = that.variablesdb_jobtitle.slice();
      }
    });

    this.mostusedservice.getAlljobtype().subscribe(function (data) {
      if (data.status) {
        // that.db_jobtype = data.data;
        that.variablesdb_jobtype = data.data;
        that.db_jobtype = that.variablesdb_jobtype.slice();
      }
    });

    this.mostusedservice.getAllpayroll_group().subscribe(function (data) {
      if (data.status) {
        that.db_payroll_group = data.data;
        that.useremployeeinfo.get('user_id_payroll_group').setValue(that.db_payroll_group[0]._id);
      }
    });

    this.mostusedservice.getAllDocumentType().subscribe(function (data) {
      if (data.status) {
        that.db_Doc_types = data.data;
      }
    });

    this.mostusedservice.getAllLocation().subscribe(function (data) {
      if (data.status) {
        that.variablesdb_locations = data.data;
        that.db_locations = that.variablesdb_locations.slice();
      }
    });
    this.mostusedservice.getAllDepartment().subscribe(function (data) {
      if (data.status) {
        // that.db_Departmaents = data.data;
        that.variablesdb_Departmaents = data.data;
        that.db_Departmaents = that.variablesdb_Departmaents.slice();
      }
    });
    this.getAllLoction();
    // this.getAllShift();
    this.getspokenLanguage();
    this.getAllCreditCard();

    this.userpersonalinfo = this.formBuilder.group({
      username: ['', Validators.required],
      usermiddlename: [""],
      userlastname: ['', Validators.required],
      useremail: ["", [Validators.required, Validators.email]],
      password: [""],
      userssn: [""],
      user_no: [""],
      userroleId: ["", Validators.required],
      usergender: [""],
      // project_email_group: [""],
      // compliance_officer: ["false"],
      userdob: [""],
      userstatus: ["", Validators.required],
      login_from: ["All", Validators.required],
      usersDocument: new FormArray([]),
      allow_for_projects: ["true"]
    });
    this.usercontactinfo = this.formBuilder.group({
      userphone: [""],
      usersecondary_email: ["", [Validators.email]],
      userstreet1: [""],
      userstreet2: [""],
      usercity: [""],
      user_state: [""],
      userzipcode: [""],
      usercountry: [""]
    });
    this.useremployeeinfo = this.formBuilder.group({
      usersalary: ["0.00", Validators.required],
      userstartdate: [""],
      usermanager_id: [""],
      usersupervisor_id: [""],
      userlocation_id: [""],
      userdepartment_id: ["", Validators.required],
      userjob_type_id: [""],
      userjob_title_id: [""],
      user_payroll_rules: [this.payroll_cycles[0].value],
      user_id_payroll_group: [""],
      card_no: [""],
      card_type: [""],
      usercostcode: [""],
      user_languages: []
    });

    this.usersendinvitation = this.formBuilder.group({
      recipient: ["", [Validators.required, Validators.email]]
    });

    this.getAllCostCode();
  }

  getspokenLanguage() {
    let that = this;
    that.httpCall.httpGetCall(httproutes.OTHER_LANGUAGE_GET).subscribe(function (params) {
      if (params.status) {
        that.variableslanguageList = params.data;
        that.languageList = that.variableslanguageList.slice();
        // that.languageList = params.data;
      }
    });
  }
  language_change(event: any) {

    let language = event.value;
    this.useremployeeinfo.get("user_languages").setValue(language);
  }

  get u_from() { return this.userpersonalinfo.controls; }
  get U_D() { return this.u_from.usersDocument as FormArray; }

  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
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
         } else {
           const imgBase64Path = e.target.result;
           this.cardImageBase64 = imgBase64Path;
           this.isImageSaved = true;
         }
       };
     }; 
     reader.readAsDataURL(fileInput.target.files[0]);
   } */
  }

  documentChangeEvent(fileInput: any, index: any) {

    if (fileInput.target.files && fileInput.target.files[0]) {
      this.document_array[index] = fileInput.target.files[0];
    }
  }

  removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  addDoc() {
    this.doc_controller++;

    this.U_D.push(this.formBuilder.group({
      userdocument_type_id: ['', Validators.required],
      userdocument_expire_date: ['']
    }));
  }

  showHideExpirationDate(event: any, i: any) {
    let found = this.db_Doc_types.find((element: any) => element._id == event);
    this.showHideExpiration[i] = found.is_expiration;
  }

  exit() {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: that.close_this_window,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        // Move to the Users listing
        setTimeout(() => {
          that.router.navigate(['/employee-list']);
        }, 100);
      }
    });
  }

  async savedata() {
    let that = this;
    this.userpersonalinfo.markAllAsTouched();
    this.usercontactinfo.markAllAsTouched();
    this.useremployeeinfo.markAllAsTouched();
    this.saveUserInDB("");
    // if (this.userpersonalinfo.valid && this.useremployeeinfo.valid && this.usercontactinfo.valid) {
    //   swalWithBootstrapButtons.fire({
    //     title: this.YOU_WANT_TO_ADD_SCHEDULE,
    //     showDenyButton: true,
    //     showCancelButton: false,
    //     confirmButtonText: this.Compnay_Equipment_Delete_Yes,
    //     denyButtonText: this.Compnay_Equipment_Delete_No,
    //   }).then((result) => {
    //     if (result.isConfirmed) {
    //       this.openScheduleform({});
    //     } else {
    //       this.saveUserInDB("");
    //     }

    //   });
    // }
  }

  // openScheduleform(reqData) {
  //   const dialogRef = this.dialog.open(ScheduleFormEmployee, {
  //     data: {
  //       locationList: this.locationList, shiftList: this.shiftList
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result != "" && result != null && result != undefined)
  //     {
  //       this.saveUserInDB(result);
  //     }
  //   });
  // }



  async saveUserInDB(scheduleData: any) {
    let that = this;
    if (that.userpersonalinfo.valid && that.useremployeeinfo.valid && that.usercontactinfo.valid) {
      let usersDocument = that.userpersonalinfo.value.usersDocument || [];
      delete that.userpersonalinfo.value.usersDocument;
      let reqObject = {
        ...that.userpersonalinfo.value,
        ...that.useremployeeinfo.value,
        usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),
        ...that.usercontactinfo.value
      };

      reqObject.allow_for_projects = String(reqObject.allow_for_projects);

      let department_name = that.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
      let jobtitle_name = that.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
      let costcode_name = that.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });

      reqObject.department_name = department_name != undefined ? department_name.department_name : "";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";

      reqObject.userfullname = reqObject.username + " " + reqObject.usermiddlename + " " + reqObject.userlastname;
      reqObject.userfulladdress = reqObject.userstreet1 + "," + reqObject.userstreet2 + "," + reqObject.usercity + "," + reqObject.user_state + reqObject.user_state + "-" + reqObject.userzipcode;
      reqObject = await that.removeEmptyOrNull(reqObject);
      const formData = new FormData();
      formData.append('file', that.filepath);
      formData.append('reqObject', JSON.stringify(reqObject));
      that.spinner.spin$.next(true);
      that.employeeservice.saveEmaployee(formData).subscribe(function (Data) {
        if (Data.status) {
          if (scheduleData != null && scheduleData != undefined && scheduleData != "") {
            var reqObjectschedule = scheduleData;
            reqObjectschedule.schedule_employee_ids = [Data.data._id];

            that.httpCall.httpPostCall(httproutes.PORTAL_SHIFT_NEW_ADD, reqObjectschedule).subscribe(function (params) {

            });
          }
          if (usersDocument.length) {
            usersDocument.forEach((element: any, i: any) => {
              element.userdocument_expire_date = element.userdocument_expire_date.getTime() / 1000;
              const formData_doc = new FormData();
              formData_doc.append('file', that.document_array[i]);
              formData_doc.append('reqObject', JSON.stringify(element));
              formData_doc.append('user_id', Data.data._id);
              that.employeeservice.employeeDocumentUpdate(formData_doc).subscribe(function (data_doc) {
                if (data_doc.status) {
                } else {
                  that.spinner.spin$.next(false);
                  that.snackbarservice.openSnackBar(data_doc.message, "error");
                }
                if (usersDocument.length == i + 1) {
                  that.spinner.spin$.next(false);
                  that.router.navigate(['/employee-list']);
                  that.snackbarservice.openSnackBar(Data.message, "success");
                }
              });
            });
          } else {
            that.spinner.spin$.next(false);
            that.snackbarservice.openSnackBar(Data.message, "success");
            that.router.navigate(['/employee-list']);
          }
        } else {
          that.spinner.spin$.next(false);
          that.snackbarservice.openSnackBar(Data.message, "error");
        }
      });
    }
  }

  sendInvitation() {
    let that = this;
    that.usersendinvitation.markAllAsTouched();
    if (that.usersendinvitation.valid) {
      let req_temp = that.usersendinvitation.value;

      let reqObject = {
        recipient: req_temp.recipient
      };

      this.spinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.SEND_INVITATION, reqObject).subscribe(function (params_new) {
        that.spinner.spin$.next(false);
        if (params_new.status) {
          that.snackbarservice.openSnackBar(params_new.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
        }
      });
    }
  }

  removeEmptyOrNull = (obj: any) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && this.removeEmptyOrNull(obj[k]) ||
      (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
  };

  getAllLoction() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_LOCATION_GETDATA).subscribe(function (params) {
      if (params.status) {
        that.locationList = params.data;
      }
    });
  }

  // getAllShift() {
  //   let that = this;
  //   this.httpCall.httpGetCall(httproutes.PORTAL_SHIFT_GET_ALL).subscribe(function (params) {
  //     if (params.status)
  //     {
  //       that.shiftList = params.data;
  //     }
  //   });
  // }
}


@Component({
  selector: 'app-employee-schedule',
  templateUrl: './employee-schedule.html',
  styleUrls: ['./employee-form.component.scss']
})

export class ScheduleFormEmployee {
  public variables2: any = [];
  public locationList: any = [];
  shiftList: any = [];
  public form: FormGroup;
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon = icon.SAVE_WHITE;
  constructor(public dialogRef: MatDialogRef<ScheduleFormEmployee>, private modeService: ModeDetectService, public mostusedservice: Mostusedservice,
    private formBuilder: FormBuilder, public httpCall: HttpCall, public route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {


    this.locationList = data.locationList;
    this.shiftList = data.shiftList;


    this.form = this.formBuilder.group({
      schedule_location_id: ["", [Validators.required]],
      schedule_shift_id: ["", [Validators.required]]
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }
    });
  }

  saveData() {
    let that = this;
    if (this.form.valid) {
      let reqObject = this.form.value;
      that.dialogRef.close(reqObject);
    }
  }

}