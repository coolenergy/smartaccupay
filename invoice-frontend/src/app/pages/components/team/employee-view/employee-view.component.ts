import { Component, OnInit, ViewChild, ElementRef, Inject, Input } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmployeeService } from '../employee.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { configdata } from 'src/environments/configData';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { HttpCall } from "src/app/service/httpcall.service";
import { httproutes, icon, localstorageconstants } from "src/app/consts";
import { Location } from '@angular/common';
import { amountChange, commonFileChangeEvent, epochToDateTime, formatPhoneNumber, LanguageApp, MMDDYYYY, MMDDYYYY_formet, numberWithCommas, percentage_field, timeDateToepoch } from 'src/app/service/utils';
import { TeamHistory } from '../employee-list/employee-list.component';
import { MatStepper } from '@angular/material/stepper';
//import { SendProjectDocumentExpiration } from '../../project/project-documents/project-documents.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { SafetyTalkScheduleForm, SafetyTalkSendForm } from '../../project/project-safety-talks/project-safety-talks.component';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { ModeDetectService } from '../../map/mode-detect.service';

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

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-employee-view',
  templateUrl: './employee-view.component.html',
  styleUrls: ['./employee-view.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true }
  }]
})

export class EmployeeViewComponent implements OnInit {
  @ViewChild('OpenFilebox') OpenFilebox: any;
  @ViewChild('OpenFilebox_mobile') OpenFilebox_mobile: any;
  @ViewChild(DataTableDirective, { static: false }) datatableElement: any;
  dtOptions: DataTables.Settings = {};
  dtOptions_Emergency: DataTables.Settings = {};
  dtOptions_Document: DataTables.Settings = {};
  dtOptions_UsersProject: DataTables.Settings = {};
  showUserProjectTable: boolean = true;
  dtTrigger: any = new Subject();
  company_logo: any;
  userfullName: any;
  login_from: any = configdata.LOGIN_FROM;
  companywebsite: any;
  companyname: any;
  companyaddress: any;
  companyaddresscity: any;
  companyaddressstate: any;
  companyaddresszip: any;
  step1Complete = false;
  step2Complete = false;
  load_table_Emergency: boolean = false;
  is_role_disabled: boolean = false;
  role_name: any;
  cardImageBase64_mobile: any;
  imageError: any;
  saveIcon = icon.SAVE_WHITE;
  isImageSaved: any;
  isImageSaved_mobile: any;
  change_mobile_pic: boolean = false;
  defalut_image: string = icon.MALE_PLACEHOLDER;
  defalut_image_mobile: string = icon.MALE_PLACEHOLDER;
  defalut_female_image: string = icon.FEMALE_PLACEHOLDER;
  defalut_female_image_mobile: string = icon.FEMALE_PLACEHOLDER;
  cardImageBase64: any;
  filepath: any;
  filepath_mobile: any;
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
  userpersonalinfo: FormGroup;
  userpersonalinfo_change: boolean = false;
  usercontactinfo: FormGroup;
  useremployeeinfo: FormGroup;
  usersendinvitation: FormGroup;
  user_data: any;
  user_id: any;
  selectedIndex = 0;
  emergency_contacts: any;
  user_documents: any;
  user_projects: any;
  idcardinfo: FormGroup;
  load_table_userDocument: boolean = false;
  maxDate = new Date();
  Employee: any = configdata.TEAM;
  printEnbale: boolean = false;
  step_index: number = 0;
  Employee_View_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Project_Documents_Do_Want_Delete: string = "";
  locallanguage: any;
  tmpSafety_talk: boolean = true;
  emergencyicon = icon.EMERGENCY_CONTACT;
  emergencyicon_white = icon.EMERGENCY_CONTACT_WHITE;
  documentIcon = icon.EMPLOYEE_DOCUMENT;
  documentIcon_white = icon.EMPLOYEE_DOCUMENT_WHITE;
  //project_id: any;
  role_permission_tab: any;
  public variables2: any = [];
  public filteredList5 = this.variables2.slice();
  db_employees: any = [];
  variableslanguageList: any = [];
  languageList: any = this.variableslanguageList.slice();
  showicard: boolean = true;
  close_this_window: string = "";


  // Safety talk Table variables
  Safetytalk_Filename: any;
  Safetytalk_FileLanguage: any;
  Safetytalk_FileDate: any;
  Safetytalk_MediaType: any;
  Safetytalk_Organization: any;
  Safetytalk_TrainingDate: any;
  Safetytalk_Performedby: any;
  Safetytalk_Collection: any;
  Safetytalk_Action: any;
  Safetytalk_View: any;

  Document_OnQRcode_Yes: any;
  Document_OnQRcode_No: any;

  selectedProjectId = '';
  mode: any;
  subscription: Subscription;
  historyIcon: string;
  archivedIcon: string;
  backIcon: string;
  sendIcon: string;
  editIcon: string;
  deleteIcon: string;
  nextIcon: string;
  trashIcon: string;
  exitIcon: string;

  employeeicon = icon.EMPLOYEE_INF0;
  employeewhite = icon.EMPLOYEE_INFO_WHITE;
  contacticon = icon.CONTACT_INFO;
  contactwhiteicon = icon.CONTACT_INFO_WHITE;
  personalicon = icon.PERSONAL_INFO;
  personalwhiteicon = icon.PERSONAL_INFO_WHITE;
  projectAccessIcon = icon.PROJECT_ACCSESS;
  projectAccessWhiteicon = icon.PROJECT_ACCSESS_WHITE;
  add_my_self = icon.ADD_MY_SELF_WHITE;
  ProjectName: any;
  ProjectStatus: any;
  ProjectPriority: any;
  ProjectStartDate: any;
  ProjectEndDate: any;
  ProjectCompletePercentage: any;
  LastSettingUpdated: any;
  Action: any;
  All_Remove: any;
  Empty_Temporary_Password: string;


  constructor (private modeService: ModeDetectService, public sb: Snackbarservice, private location: Location, public dialog: MatDialog, public translate: TranslateService, public mostusedservice: Mostusedservice,
    private formBuilder: FormBuilder, private http: HttpClient, public employeeservice: EmployeeService, public snackbarservice: Snackbarservice,
    private router: Router, public route: ActivatedRoute, public httpCall: HttpCall, public uiSpinner: UiSpinnerService) {

    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      this.Employee_View_Do_Want_Delete = this.translate.instant('Employee_View_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.Project_Documents_Do_Want_Delete = this.translate.instant('Project_Documents_Do_Want_Delete');
      this.Empty_Temporary_Password = this.translate.instant('Empty_Temporary_Password');
      this.Safetytalk_Filename = this.translate.instant('SafetyTalks-Superadmin-FileName');
      this.Safetytalk_FileLanguage = this.translate.instant('SafetyTalks-Superadmin-FileLanguage');
      this.Safetytalk_FileDate = this.translate.instant('SafetyTalks-Superadmin-FileDate');
      this.Safetytalk_MediaType = this.translate.instant('SafetyTalks-Superadmin-MediaType');
      this.Safetytalk_Organization = this.translate.instant('SafetyTalks-Superadmin-Organization');
      this.Safetytalk_TrainingDate = this.translate.instant('Project_Settings_SafetyTalk_Past_TrainingDate');
      this.Safetytalk_Performedby = this.translate.instant('Project_Settings_SafetyTalk_Past_PerformedBy');
      this.Safetytalk_Collection = this.translate.instant('Project_Settings_SafetyTalk_Past_Collection');
      this.Safetytalk_Action = this.translate.instant('Project_Settings_SafetyTalk_Past_Action');
      this.Safetytalk_View = this.translate.instant('Dashboard-View');

      this.Document_OnQRcode_Yes = this.translate.instant('Project_Settings_Survey_Yes');
      this.Document_OnQRcode_No = this.translate.instant('Project_Settings_Survey_No');

      this.ProjectName = this.translate.instant('Project-from-Name');
      this.ProjectStatus = this.translate.instant('Project_Card_Project_Status');
      this.ProjectPriority = this.translate.instant('Project-Info-Settings-Priority');
      this.ProjectStartDate = this.translate.instant('Project-from-Start-Date');
      this.ProjectEndDate = this.translate.instant('Project-from-End-Date');
      this.ProjectCompletePercentage = this.translate.instant('Project-from-Completed-In-Percentage');
      this.LastSettingUpdated = this.translate.instant('Project-from-Last-Updated');
      this.Action = this.translate.instant('All-Action');
      this.All_Remove = this.translate.instant('All_Remove');
      this.close_this_window = this.translate.instant("close_this_window");

      if (i != 0) {
        setTimeout(() => {
          this.rerenderfunc();
        }, 1000);
      }
      i++;
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.historyIcon = icon.HISTORY;
      this.archivedIcon = icon.ARCHIVE;
      this.backIcon = icon.BACK;
      this.sendIcon = icon.SEND;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
      this.nextIcon = icon.NEXT;
      this.trashIcon = icon.TRASH;
      this.exitIcon = icon.CANCLE;
      this.rerenderfunc();
    } else {
      this.historyIcon = icon.HISTORY_WHITE;
      this.archivedIcon = icon.ARCHIVE_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.sendIcon = icon.SEND_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
      this.nextIcon = icon.NEXT_WHITE;
      this.trashIcon = icon.TRASH_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.rerenderfunc();
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.historyIcon = icon.HISTORY;
        this.archivedIcon = icon.ARCHIVE;
        this.backIcon = icon.BACK;
        this.sendIcon = icon.SEND;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
        this.nextIcon = icon.NEXT;
        this.trashIcon = icon.TRASH;
        this.exitIcon = icon.CANCLE;
        this.rerenderfunc();
      } else {
        this.mode = 'on';
        this.historyIcon = icon.HISTORY_WHITE;
        this.archivedIcon = icon.ARCHIVE_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.sendIcon = icon.SEND_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
        this.nextIcon = icon.NEXT_WHITE;
        this.trashIcon = icon.TRASH_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.rerenderfunc();
      }
    });
    this.userpersonalinfo = this.formBuilder.group({
      username: ['', Validators.required],
      usermiddlename: [""],
      userlastname: ['', Validators.required],
      useremail: ["", Validators.required],
      password: [""],
      userssn: [""],
      user_no: [""],
      userroleId: [""],
      usergender: [""],
      project_email_group: [""],
      compliance_officer: ["false"],
      userdob: [""],

      userstatus: [""],
      login_from: ['', Validators.required],
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
      usersalary: ["", Validators.required],
      userstartdate: [""],
      usermanager_id: [""],
      usersupervisor_id: [""],
      userlocation_id: [""],
      userdepartment_id: ["", Validators.required],
      userjob_type_id: [""],
      userjob_title_id: [""],
      user_payroll_rules: ["", Validators.required],
      user_id_payroll_group: ["", Validators.required],
      card_no: ["", Validators.pattern('^[ 0-9]*$')],
      card_type: ["", Validators.required],
      usercostcode: [""],
      user_languages: ["", Validators.required],
    });

    this.usersendinvitation = this.formBuilder.group({
      recipient: ["", Validators.email],
      name: [""]
    });

    this.idcardinfo = this.formBuilder.group({
      show_id_card_on_qrcode_scan: ['', Validators.required],
    });

    var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.company_logo = company_data.companydata.companylogo;
    //this.userfullName = company_data.UserData.userfullname;
    if (this.router.getCurrentNavigation()!.extras.state) {
      this.step_index = Number(this.router.getCurrentNavigation()!.extras.state!.value);
    }


    if (this.route.snapshot.queryParamMap.get('tab_index') != null) {
      this.step_index = Number(this.route.snapshot.queryParamMap.get('tab_index'));
    }
  }

  rerenderfunc() {
    this.updated_Emergency();
    this.update_document();
    this.updated_Safety_talks();
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.showUserProjectTable = false;
    let that = this;
    setTimeout(() => {
      that.dtOptions_UsersProject.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptions_UsersProject.columns = that.getUserProjectsColumName();
      that.showUserProjectTable = true;
    }, 100);
  }

  language_change(event: any) {

    let language = event.value;
    this.useremployeeinfo.get("user_languages")!.setValue(language);
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

  back(): void {
    this.location.back();
  }

  saveIDcard() {
    let that = this;
    if (that.idcardinfo.valid) {
      let req_temp = that.idcardinfo.value; req_temp._id = that.user_id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.ID_CARD_SAVE, req_temp).subscribe(function (params_new) {
        if (params_new.status) {
          that.sb.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
        } else {
          that.sb.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }

  amountChange(params: any) {
    let self = this;
    self.useremployeeinfo.get("usersalary")!.setValue(amountChange(params));

  }

  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(this.locallanguage);
    this.maxDate.setDate(this.maxDate.getDate() - 5114);
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);

    this.role_permission_tab = userdata.role_permission.users;
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    this.user_id = this.route.snapshot.paramMap.get('idparms');
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    this.dtOptions_Emergency = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };
    this.dtOptions_Document = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      retrieve: true,
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.user_id = this.route.snapshot.paramMap.get('idparms');
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PROJECT_SAFETY_TALK_PAST_DATATABLE_USER,
            dataTablesParameters, { headers: headers }
          ).subscribe(resp => {

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },
      columns: this.getSafetyTalksColumns(),
      "drawCallback": () => {
        $('.button_stSchedultClass').on('click', (event) => {
          // Schedule safety talk
          let data1 = event.target.getAttribute("edit_tmp_id")!.replace(/\\/g, "\'");
          let data = JSON.parse(data1);
          this.seftyTalkSchedule(data);
        });
        $('.button_stViewClass').on('click', (event) => {
          // View safety talk
          let project_id = this.route.snapshot.paramMap.get('idparms');
          let data1 = event.target.getAttribute("edit_tmp_id")!.replace(/\\/g, "\'");
          let data = JSON.parse(data1);
          this.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.past_safetytalk_pdf, safety_talk_id: data._id, project_id: project_id, user_id: this.user_id, backto: "team" } });
        });
        $('.button_stSendClass').on('click', (event) => {
          // Send safety talk
          let data1 = event.target.getAttribute("edit_tmp_id")!.replace(/\\/g, "\'");
          let data = JSON.parse(data1);
          let type = "Safety Talk";
          this.sendpastlist(data, type);
        });
      }
    };
    let that = this;
    that.role_name = userdata.UserData.role_name;
    if (this.route.snapshot.paramMap.get('idparms') != null) {
      this.user_id = this.route.snapshot.paramMap.get('idparms');
      this.mostusedservice.getOneUser({ _id: this.user_id }).subscribe(function (data) {
        if (data.status) {
          if (data.data != null) {
            that.user_data = data.data;

            if (that.user_data.userpicture != "") {
              if (that.user_data.usergender == 'Male') {
                that.defalut_image = that.user_data.userpicture;
                if (that.user_data.userpicture != icon.MALE_PLACEHOLDER) {
                  that.defalut_female_image = that.user_data.userpicture;
                }
              }
              if (that.user_data.usergender == 'Female') {
                that.defalut_female_image = that.user_data.userpicture;
                if (that.user_data.userpicture != icon.FEMALE_PLACEHOLDER) {
                  that.defalut_image = that.user_data.userpicture;
                }
              }
            }

            if (that.user_data.usermobile_picture != "") {
              if (that.user_data.usergender == 'Male') {
                that.defalut_image_mobile = that.user_data.usermobile_picture;
                if (that.user_data.usermobile_picture != icon.MALE_PLACEHOLDER) {
                  that.defalut_female_image_mobile = that.user_data.usermobile_picture;
                }
              }
              if (that.user_data.usergender == 'Female') {
                that.defalut_female_image_mobile = that.user_data.usermobile_picture;
                if (that.user_data.usermobile_picture != icon.FEMALE_PLACEHOLDER) {
                  that.defalut_image_mobile = that.user_data.usermobile_picture;
                }
              }
            }

            let complianceOfficer = "false";
            if (that.user_data.compliance_officer) {
              complianceOfficer = that.user_data.compliance_officer.toString();
            }

            that.userfullName = that.user_data.userfullname;
            that.userpersonalinfo = that.formBuilder.group({
              username: [that.user_data.username, Validators.required],
              usermiddlename: [that.user_data.usermiddlename],
              userlastname: [that.user_data.userlastname, Validators.required],
              useremail: [that.user_data.useremail],
              password: [""],
              userssn: [that.user_data.userssn],
              user_no: [that.user_data.user_no],
              userroleId: [that.user_data.userroleId],
              usergender: [that.user_data.usergender],
              project_email_group: [that.user_data.project_email_group],
              compliance_officer: [complianceOfficer],
              userdob: [that.user_data.userdob],
              userstatus: [that.user_data.userstatus],
              login_from: [that.user_data.login_from, Validators.required],
              allow_for_projects: [that.user_data.allow_for_projects]
            });

            if (that.role_name == configdata.ROLE_ADMIN) {
              that.userpersonalinfo.get('userroleId')!.setValidators([Validators.required]);
              that.userpersonalinfo.get('userroleId')!.updateValueAndValidity();
            } else {
              that.is_role_disabled = true;
            }
            if (that.user_data.is_first) {
              that.is_role_disabled = true;
            }
            that.usercontactinfo = that.formBuilder.group({
              userphone: [that.user_data.userphone],
              usersecondary_email: [that.user_data.usersecondary_email, [Validators.email]],
              userstreet1: [that.user_data.userstreet1],
              userstreet2: [that.user_data.userstreet2],
              usercity: [that.user_data.usercity],
              user_state: [that.user_data.user_state],
              userzipcode: [that.user_data.userzipcode],
              usercountry: [that.user_data.usercountry]
            });

            that.useremployeeinfo = that.formBuilder.group({
              usersalary: [that.user_data.usersalary, Validators.required],
              userstartdate: [that.user_data.userstartdate],
              usermanager_id: [that.user_data.usermanager_id],
              usersupervisor_id: [that.user_data.usersupervisor_id],
              userlocation_id: [that.user_data.userlocation_id],
              userdepartment_id: [that.user_data.userdepartment_id, Validators.required],
              userjob_type_id: [that.user_data.userjob_type_id],
              userjob_title_id: [that.user_data.userjob_title_id],
              user_payroll_rules: [Number(that.user_data.user_payroll_rules)],
              user_id_payroll_group: [that.user_data.user_id_payroll_group],
              card_no: [that.user_data.card_no],
              card_type: [that.user_data.card_type],
              usercostcode: [that.user_data.usercostcode],
              user_languages: [that.user_data.user_languages],
            });

            that.useremployeeinfo.get("usersalary")!.setValue(numberWithCommas(that.user_data.usersalary.toFixed(2)));

            that.idcardinfo = that.formBuilder.group({
              show_id_card_on_qrcode_scan: [that.user_data.show_id_card_on_qrcode_scan],
            });


          } else {
            that.router.navigateByUrl('/employee-list');
          }
        } else {

          that.router.navigateByUrl('/employee-list');
        }
      });

      this.load_emergencycontact();
      this.load_User_document();
      let tmp_language = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
      this.dtOptions_UsersProject = {
        pagingType: 'full_numbers',
        pageLength: 10,
        serverSide: true,
        processing: true,
        responsive: false,
        language: tmp_language == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
        ajax: (dataTablesParameters: any, callback) => {
          dataTablesParameters.user_id = this.route.snapshot.paramMap.get('idparms');
          that.http
            .post<DataTablesResponse>(
              configdata.apiurl + httproutes.PORTAL_GET_USER_PROJECTS_DATATABLES,
              dataTablesParameters, { headers: headers }
            ).subscribe(resp => {
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: resp.data
              });
            });
        },
        columns: that.getUserProjectsColumName(),
        "drawCallback": () => {
          $('.button_removeProjectUserClass').on('click', (event) => {
            // Delete Item here
            let data = JSON.parse(event.target.getAttribute("edit_tmp_id")!);
            this.removeUserProject(data);
          });
        }
      };

      let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_COMPANY_GET, { _id: userData.companydata._id }).subscribe(function (params) {
        if (params.status) {
          that.companywebsite = params.data.companywebsite;
          that.companyname = params.data.companyname;
          that.companyaddress = params.data.companyaddress;
          that.companyaddresscity = params.data.companyaddresscity;
          that.companyaddressstate = params.data.companyaddressstate;
          that.companyaddresszip = params.data.companyaddresszip;
        }
      });
    }

    this.mostusedservice.getAllRoles().subscribe(function (data) {
      if (data.status) {
        that.db_roles = data.data;
        that.db_roles.forEach((element: any) => { });
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
      }
    });

    this.mostusedservice.getAllDocumentType().subscribe(function (data) {
      if (data.status) {
        that.db_Doc_types = data.data;
      }
    });

    this.mostusedservice.getAllLocation().subscribe(function (data) {
      if (data.status) {
        // that.db_locations = data.data;
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
    this.getspokenLanguage();
    this.getAllCostCode();
    this.getAllCreditCard();

  }

  async removeUserProject(requestObject: any) {
    let that = this;
    that.uiSpinner.spin$.next(true);
    let data = await that.httpCall.httpPostCall(httproutes.PORTAL_SAVE_PROJECT_USER, requestObject).toPromise();
    if (data.status) {
      that.uiSpinner.spin$.next(false);
      that.snackbarservice.openSnackBar(data.message, "success");
      $('#dtOptions_UsersProject').DataTable().ajax.reload(() => { }, false);
      $('#dtOptions_UsersProject').DataTable().draw(false);
      this.showUserProjectTable = false;
      setTimeout(() => {
        this.showUserProjectTable = true;
      }, 100);
    } else {
      that.uiSpinner.spin$.next(false);
      that.snackbarservice.openSnackBar(data.message, "error");
    }
  }

  getUserProjectsColumName() {
    let that = this;
    //let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    return [
      {
        title: that.ProjectName,
        data: 'project_name',
        defaultContent: ""
      },
      {
        title: that.ProjectStatus,
        data: 'project_status',
        defaultContent: ""
      },
      {
        title: that.ProjectPriority,
        data: 'project_priority',
        defaultContent: ""
      },
      {
        title: that.ProjectStartDate,
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY(full.project_start_date);
        },
        defaultContent: ""
      },
      {
        title: that.ProjectEndDate,
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY(full.project_end_date);
        },
        defaultContent: ""
      },
      {
        title: that.ProjectCompletePercentage,
        render: function (data: any, type: any, full: any) {
          return percentage_field(full.project_complete_per);
        },
        data: '',
        defaultContent: ""
      },
      {
        title: that.LastSettingUpdated,
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY_formet(full.project_last_setting_updated_at);
        },
        defaultContent: ""
      },
      {
        title: that.Action,
        render: function (data: any, type: any, full: any) {
          let tmp_tmp = {
            _id: full._id,
            user_id: full.user_id,
            project_id: full.project_id,
            created_by: full.created_by,
            created_at: full.created_at,
          };
          let edit = '';
          if (that.role_permission_tab.employeeProjectAccess.Edit) {
            edit = `<a edit_tmp_id=` + JSON.stringify(tmp_tmp) + ` class="button_removeProjectUserClass"><img src="` + that.deleteIcon + `" alt="" class="" height="15px">` + that.All_Remove + `</a>`;
          }
          return `
            <div class="dropdown">
              <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  edit_tmp_id='`+ JSON.stringify(full) + `' aria-hidden="true"></i>
              <div class="dropdown-content-cust">
                ` + edit + `
              </div>
          </div>`;
        },
        width: "1%",
        orderable: false
      }
    ];
  }
  getSafetyTalksColumns() {

    let that = this;
    return [{
      title: this.Safetytalk_Filename,
      data: 'filename'
    }, {
      title: this.Safetytalk_FileLanguage,
      data: 'filelanguage'
    }, {
      title: this.Safetytalk_FileDate,
      render: function (data: any, type: any, full: any) {
        return MMDDYYYY(timeDateToepoch(full.filedate));
      }
    },
    {
      title: this.Safetytalk_MediaType,
      data: 'mediatype'
    },
    {
      title: this.Safetytalk_Organization,
      data: 'organization'
    },
    {
      title: this.Safetytalk_TrainingDate,
      render: function (data: any, type: any, full: any) {
        return MMDDYYYY_formet(full.perform_date);
      },
    },
    {
      title: this.Safetytalk_Performedby,
      data: 'perform_by_name'
    },
    {
      title: this.Safetytalk_Collection,
      data: 'collection'
    }, {
      title: this.Safetytalk_Action,
      render: function (data: any, type: any, full: any) {
        let temp = JSON.stringify(full).replace(/'/g, "\\");
        return `
              <div class="dropdown">
                <i class="fas fa-ellipsis-v cust-fontsize-tmp"  edit_tmp_id='`+ temp + `' aria-hidden="true"></i>
                <div class="dropdown-content-cust">
                  <a edit_tmp_id='`+ temp + `' class="button_stViewClass" >` + that.Safetytalk_View + `</a>
                </div>
            </div>`;
      },
      width: "1%",
      orderable: false
    }
    ];
  }

  async updated_Safety_talks() {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    that.tmpSafety_talk = false;
    $('#dtOptions_checkList_user').DataTable().draw(false);
    $('#dtOptions_checkList_user').DataTable().ajax.reload(() => { }, false);

    that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    that.dtOptions.columns = await that.getSafetyTalksColumns();
    setTimeout(() => {
      that.tmpSafety_talk = true;
    }, 2000);
    // this.datatableElement.dtInstance.then(async (dtInstance: DataTables.Api) => {

    //   dtInstance.destroy();

    //   that.dtTrigger.next();
    //   that.tmpSafety_talk = true;
    // });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }

  updated_Emergency() {
    let that = this;
    this.load_table_Emergency = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions_Emergency.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.load_table_Emergency = true;
    }, 10);
  }

  update_document() {
    let that = this;
    this.load_table_userDocument = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions_Document.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.load_table_userDocument = true;
      that.load_User_document();
    }, 10);
  }

  sendpastlist(reqData: any, type: any) {
    // const dialogRef = this.dialog.open(SafetyTalkSendForm, {
    //   data: {
    //     safetytalktype: type,
    //     data: reqData,
    //     type: "past"
    //   }

    // });

    // dialogRef.afterClosed().subscribe(result => {
    // });

  }

  seftyTalkSchedule(reqData: any) {
    // let project_id = this.route.snapshot.paramMap.get('idparms');

    // const dialogRef = this.dialog.open(SafetyTalkScheduleForm, {
    //   data: {
    //     reqData: reqData,
    //     project_id: project_id,

    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   $('#dtOptions_toolbox').DataTable().ajax.reload();
    // });
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
      }
    });
  }

  load_emergencycontact() {
    let that = this;
    this.load_table_Emergency = false;
    this.httpCall.httpPostCall(httproutes.EMERGENCY_CONTACT_USERS, { _id: this.user_id }).subscribe(function (params) {
      if (params.status) {
        let temp_data = [];
        for (let i = 0; i < params.data.length; i++) {
          let temp_object = params.data[i];
          let currentDate = new Date(temp_object.updatedAt);
          let timestamp = currentDate.getTime();
          var date = new Date(timestamp).toLocaleDateString("en-us");
          const datelast = moment(timestamp).format('L');
          temp_object.updated_date = datelast;
          temp_object.last_validate_date = temp_object.is_validated ? MMDDYYYY(temp_object.validated_at) : '';
          temp_data.push(temp_object);
        }
        that.emergency_contacts = temp_data;
        that.load_table_Emergency = true;
      }
    });
  }

  load_User_document() {
    let that = this;
    this.load_table_userDocument = false;
    this.httpCall.httpPostCall(httproutes.EMPLOYEE_DOCUMENT, { user_id: that.user_id }).subscribe(function (params) {
      if (params.status) {
        that.load_table_userDocument = true;
        if (params.data.length > 0) {
          that.user_documents = [];
          for (var i = 0; i < params.data.length; i++) {
            var showonQR = "";
            if (params.data[i].show_on_qrcode_scan) {
              showonQR = that.Document_OnQRcode_Yes;
            } else {
              showonQR = that.Document_OnQRcode_No;
            }
            params.data[i].show_on_qrcode_scan_display = showonQR;
            that.user_documents.push(params.data[i]);
          }
        }
      }
    });
  }

  selectionChange(e: any) {
    this.step1Complete = false;
    if (e.selectedIndex == 6) {
      let that = this;
      this.showicard = false;
      this.user_id = this.route.snapshot.paramMap.get('idparms');
      this.mostusedservice.getOneUser({ _id: this.user_id }).subscribe(function (data) {
        that.showicard = true;
        if (data.status) {
          if (data.data != null) {
            that.user_data = data.data;
            that.userfullName = that.user_data.userfullname;
          }
        }
      });
    }
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
  }

  fileChangeEvent_mobile(fileInput: any) {
    this.imageError = null;
    this.change_mobile_pic = true;
    commonFileChangeEvent(fileInput, 'image').then((result: any) => {
      if (result.status) {
        this.filepath_mobile = result.filepath;
        this.cardImageBase64_mobile = result.base64;
        this.isImageSaved_mobile = true;
      } else {
        this.imageError = result.message;
        this.snackbarservice.openSnackBar(result.message, "error");
      }
    });
  }

  documentChangeEvent(fileInput: any, index: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      this.document_array[index] = fileInput.target.files[0];
    }
  }

  openfilebox() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  openfilebox_mobile() {
    let el: HTMLElement = this.OpenFilebox_mobile.nativeElement;
    el.click();
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  addDoc() {
    this.doc_controller++;
    this.U_D.push(this.formBuilder.group({
      userdocument_type_id: ['', Validators.required],
      userdocument_expire_date: ['']
    }));
  }

  removeEmptyOrNull = (obj: any) => {
    Object.keys(obj).forEach(k =>
      (obj[k] && typeof obj[k] === 'object') && this.removeEmptyOrNull(obj[k]) ||
      (!obj[k] && obj[k] !== undefined) && delete obj[k]
    );
    return obj;
  };

  openDialog(reqData: any) {
    const dialogRef = this.dialog.open(EmergencycontactFrom, {
      data: { user_id: this.user_id, reqData: reqData },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.load_emergencycontact();

    });
  }

  openDialogDocument(reqData: any) {
    const dialogRef = this.dialog.open(DocumentUpdateFrom, {
      height: '350px',
      data: { user_id: this.user_id, reqData: reqData },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.load_User_document();
    });
  }

  openUserDocumentHistoryDialog() {
    const dialogRef = this.dialog.open(UserDocumentHistoryComponent, {
      height: '500px',
      width: '1200px',
      data: {
        user_id: this.user_id,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openDialogReminderDocument(reqData: any) {
    // const dialogRef = this.dialog.open(SendProjectDocumentExpiration, {
    //   data: { user_id: this.user_id, reqData: reqData }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   this.load_User_document();
    // });
  }

  // sendInvitation() {
  //   let that = this;
  //   that.usersendinvitation.markAllAsTouched();
  //   if (that.usersendinvitation.valid) {
  //     that.uiSpinner.spin$.next(true);
  //     let req_temp = that.usersendinvitation.value;

  //     let reqObject = {
  //       recipient: req_temp.recipient,
  //       name: that.user_data.username,
  //       login_email: that.user_data.useremail,
  //     };

  //     that.httpCall.httpPostCall(httproutes.SEND_INVITATION, reqObject).subscribe(function (params_new) {
  //       if (params_new.status) {
  //         that.snackbarservice.openSnackBar(params_new.message, "success");
  //         that.uiSpinner.spin$.next(false);
  //         that.usersendinvitation.reset();
  //       } else {
  //         that.snackbarservice.openSnackBar(params_new.message, "error");
  //         that.uiSpinner.spin$.next(false);
  //       }
  //     });
  //   }
  // }
  sendInvitation() {
    let that = this;
    let req_temp = that.userpersonalinfo.value;
    if (req_temp.password == "" || req_temp.password == null || req_temp.password == undefined) {
      that.snackbarservice.openSnackBar(that.Empty_Temporary_Password, "error");
    } else {
      that.uiSpinner.spin$.next(true);
      let reqObject = {
        password: req_temp.password,
        useremail: req_temp.useremail
      };

      that.httpCall
        .httpPostCall(httproutes.USER_SEND_PASSWORD, reqObject)
        .subscribe(function (params_new) {
          if (params_new.status) {
            that.snackbarservice.openSnackBar(params_new.message, "success");
            that.uiSpinner.spin$.next(false);
            that.userpersonalinfo.get("password").setValue("");
          } else {
            that.snackbarservice.openSnackBar(params_new.message, "error");
            that.uiSpinner.spin$.next(false);
          }
        });
    }
  }

  async saveAndNextPersonalInfo(stepper: MatStepper) {
    if (this.userpersonalinfo.dirty) {
      this.savePersonalInfo();
      this.userpersonalinfo.markAsPristine();
      stepper.next();
    } else {
      stepper.next();
    }
  }

  async savePersonalInfo() {

    let that = this;
    let tmp_data_emp_info = that.useremployeeinfo.value;

    this.userpersonalinfo.markAllAsTouched();


    if (this.userpersonalinfo.valid) {
      this.uiSpinner.spin$.next(true);
      let reqObject = this.userpersonalinfo.value;
      let department_name = this.db_Departmaents.find((dpt: any) => { return dpt._id == tmp_data_emp_info.userdepartment_id; });
      let jobtitle_name = this.db_jobtitle.find((dpt: any) => { return dpt._id == tmp_data_emp_info.userjob_title_id; });
      let costcode_name = this.db_costcodes.find((dpt: any) => { return dpt._id == tmp_data_emp_info.usercostcode; });
      if (reqObject.password == "" || reqObject.password == null || reqObject.password == undefined) {
        delete reqObject.password;
      }
      reqObject.department_name = department_name != undefined ? department_name.department_name : " ";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : " ";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : " ";
      let fname = reqObject.username != undefined && reqObject.username != "" ? reqObject.username : "";
      let mname = reqObject.usermiddlename != undefined && reqObject.usermiddlename != "" ? reqObject.usermiddlename : "";
      let lname = reqObject.userlastname != undefined && reqObject.userlastname != "" ? reqObject.userlastname : "";
      reqObject.userfullname = fname + " " + mname + " " + lname;

      // let userstreet1 = reqObject.userstreet1 != undefined && reqObject.userstreet1 != "" ? reqObject.userstreet1 : reqObject.userstreet1
      // let userstreet2 = reqObject.userstreet2 != undefined && reqObject.userstreet2 != "" ? reqObject.userstreet2 : reqObject.userstreet2
      // let usercity = reqObject.usercity != undefined && reqObject.usercity != "" ? reqObject.usercity : reqObject.usercity;
      // let user_state =  reqObject.user_state != undefined && reqObject.user_state != "" ? reqObject.user_state : "";
      // let userzipcode = reqObject.userzipcode != undefined && reqObject.userzipcode != ""  ? reqObject.userzipcode : "" ;
      //reqObject.userfulladdress = userstreet1 + "," + userstreet2 + "," + usercity + ","  + user_state + "-" + userzipcode;

      //reqObject = await this.removeEmptyOrNull(reqObject)

      const formData = new FormData();
      let id = this.user_id.toString();
      if (this.isImageSaved) {
        formData.append('file', this.filepath);
      } else {
        if (reqObject.usergender == 'Male') {
          reqObject.userpicture = that.defalut_image;
        } else {
          reqObject.userpicture = that.defalut_female_image;
        }
      }
      if (!that.change_mobile_pic) {
        if (reqObject.usergender == 'Male') {
          reqObject.usermobile_picture = that.defalut_image_mobile;
        } else {
          reqObject.usermobile_picture = that.defalut_female_image_mobile;
        }
      }
      formData.append("_id", id);
      formData.append('reqObject', JSON.stringify(reqObject));

      this.httpCall.httpPostCall(httproutes.EMPLOYEE_PERSONAL_EDIT, formData).subscribe(function (params) {

        if (params.status) {
          if (that.change_mobile_pic) {
            const formData_new = new FormData();
            formData_new.append('file', that.filepath_mobile);
            formData_new.append("_id", id);
            that.httpCall.httpPostCall(httproutes.EMPLOYEE_PERSONAL_MOBILE_PIC_EDIT, formData_new).subscribe(function (params_new) {
              if (params_new.status) {
                that.snackbarservice.openSnackBar(params_new.message, "success");
                that.uiSpinner.spin$.next(false);
              } else {
                that.snackbarservice.openSnackBar(params_new.message, "error");
                that.uiSpinner.spin$.next(false);
              }
            });
          } else {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.uiSpinner.spin$.next(false);
          }
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }

  async saveAndNextContactInfo(stepper: MatStepper) {
    if (this.usercontactinfo.dirty) {
      this.saveContactlInfo();
      this.usercontactinfo.markAsPristine();
      stepper.next();
    } else {
      stepper.next();
    }
  }

  async saveContactlInfo() {
    let that = this;
    let id = this.user_id.toString();
    let reqObject = this.usercontactinfo.value;
    this.usercontactinfo.markAllAsTouched();
    if (this.usercontactinfo.valid) {
      reqObject._id = id;
      this.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCall(httproutes.EMPLOYEE_CONTACT_EDIT, reqObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }

  async saveAndNextEmployeeInfo(stepper: MatStepper) {
    if (this.useremployeeinfo.dirty) {
      this.saveEmployeeInfo();
      this.useremployeeinfo.markAsPristine();
      stepper.next();
    } else {
      stepper.next();
    }
  }

  async saveEmployeeInfo() {
    console.log('saveEmployeeInfo');
    let that = this;
    this.useremployeeinfo.markAllAsTouched();
    if (this.useremployeeinfo.valid) {
      let id = this.user_id.toString();
      // let reqObject = this.useremployeeinfo.value;
      let reqObject = {

        ...this.useremployeeinfo.value,
        usersalary: this.useremployeeinfo.value.usersalary.toString().replace(/,/g, ""),

      };

      reqObject._id = id;

      let department_name = this.db_Departmaents.find((dpt: any) => { return dpt._id == reqObject.userdepartment_id; });
      let jobtitle_name = this.db_jobtitle.find((dpt: any) => { return dpt._id == reqObject.userjob_title_id; });
      let costcode_name = this.db_costcodes.find((dpt: any) => { return dpt._id == reqObject.usercostcode; });

      reqObject.department_name = department_name != undefined ? department_name.department_name : "";
      reqObject.jobtitle_name = jobtitle_name != undefined ? jobtitle_name.job_title_name : "";
      reqObject.costcode_name = costcode_name != undefined ? costcode_name.cost_code : "";
      let tmp_per_info = this.userpersonalinfo.value;
      reqObject.userfullname = tmp_per_info.username + " " + tmp_per_info.usermiddlename + " " + tmp_per_info.userlastname;

      let role_name_tmp = this.db_roles.find((dpt: any) => { return dpt._id == reqObject.userroleId; });
      reqObject.role_name = role_name_tmp != undefined ? role_name_tmp.role_name : "";

      reqObject.userqrcode = that.user_data.userqrcode;
      this.uiSpinner.spin$.next(true);

      this.httpCall.httpPostCall(httproutes.EMPLOYEE_EMPLOYEE_INFO, reqObject).subscribe(function (params) {

        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }

  editEmergencyContact(EmergencyContactData: any) {
    this.openDialog(EmergencyContactData);
  }

  deleteEmergencyContact(emergency_id: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_View_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.uiSpinner.spin$.next(true);
        this.httpCall.httpPostCall(httproutes.EMERGENCY_CONTACT_USERS_DELETE, { _id: emergency_id }).subscribe(function (params) {
          that.uiSpinner.spin$.next(false);
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.load_emergencycontact();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }
  sendreminder() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.EMERGENCY_CONTACT_SEND_REMINDER, { _id: that.user_id }).subscribe(function (params) {
      that.uiSpinner.spin$.next(false);
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.load_emergencycontact();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
      }
    });
  }
  deleteTeamDocument(reqObject: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Project_Documents_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpCall.httpPostCall(httproutes.TEAM_DOCUMENT_DELETE, reqObject).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.load_User_document();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  editTeamDocument(reqObject: any) {
    this.openDialogDocument(reqObject);
  }

  reminderDocument(reqData: any) {
    let that = this;

    let reqObject = {
      "_id": reqData._id,
      "type": "user",
    };

    that.httpCall.httpPostCall(httproutes.PROJECT_DECUMENT_EXPIRATION_SEND, reqObject).subscribe(function (params_new) {
      if (params_new.status) {
        that.snackbarservice.openSnackBar(params_new.message, "success");
        that.uiSpinner.spin$.next(false);
      } else {
        that.snackbarservice.openSnackBar(params_new.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  printfront() {
    this.printEnbale = true;
  }

  printback() {
    this.printEnbale = true;
  }

  printlandscapefront() {
    this.printEnbale = true;
  }

  printlandscapeback() {
    this.printEnbale = true;
  }

  openHistoryDialog() {
    const dialogRef = this.dialog.open(TeamHistory, {
      height: '500px',
      width: '800px',
      data: {
        employee_id: this.user_id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}

/*
  Emergency contact form
*/
@Component({
  selector: 'emergencycontact-from',
  templateUrl: './emergencycontact-from.html',
  styleUrls: ['./employee-view.component.scss']
})

export class EmergencycontactFrom {
  public form: FormGroup;
  // relation_array: any;
  user_id: any;
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon: string;
  //relation_array
  variablesrelation_array: any = [];
  relation_array: any = this.variablesrelation_array.slice();

  constructor (public dialogRef: MatDialogRef<EmergencycontactFrom>, private modeService: ModeDetectService, public mostusedservice: Mostusedservice,
    private formBuilder: FormBuilder, public httpCall: HttpCall, public route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {

    let that = this;
    if (Object.keys(data.reqData).length === 0) {
      // Add Emergency Contact
      this.form = this.formBuilder.group({
        emergency_contact_name: ["", Validators.required],
        emergency_contact_relation: ["", Validators.required],
        emergency_contact_phone: ["", Validators.required],
        emergency_contact_email: ["", [Validators.email, Validators.required]],
        emergency_contact_fulladdress: [""],
        emergency_contact_street1: [""],
        emergency_contact_street2: [""],
        emergency_contact_city: [""],
        emergency_contact_state: [""],
        emergency_contact_zipcode: [""],
        emergency_contact_country: [""],
      });
    } else {
      // Edit Emergency Contact
      this.form = this.formBuilder.group({
        emergency_contact_name: [data.reqData.emergency_contact_name, Validators.required],
        emergency_contact_relation: [data.reqData.emergency_contact_relation, Validators.required],
        emergency_contact_phone: [data.reqData.emergency_contact_phone, Validators.required],
        emergency_contact_email: [data.reqData.emergency_contact_email, [Validators.email, Validators.required]],
        emergency_contact_fulladdress: [data.reqData.emergency_contact_fulladdress],
        emergency_contact_street1: [data.reqData.emergency_contact_street1],
        emergency_contact_street2: [data.reqData.emergency_contact_street2],
        emergency_contact_city: [data.reqData.emergency_contact_city],
        emergency_contact_state: [data.reqData.emergency_contact_state],
        emergency_contact_zipcode: [data.reqData.emergency_contact_zipcode],
        emergency_contact_country: [data.reqData.emergency_contact_country],
      });
    }

    this.httpCall.httpGetCall(httproutes.REALTIONSHIP_GET_ALL).subscribe(function (params) {
      if (params.status) {
        that.variablesrelation_array = params.data;
        that.relation_array = that.variablesrelation_array.slice();
      }
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';

    if (this.mode == 'off') {

      this.backIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE;



    } else {

      this.backIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE;

      } else {
        this.mode = 'on';
        this.backIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;

      }

    });
  }

  /*
    EMERGENCY CONTACT SAVE Api call
  */
  saveData() {
    if (this.form.valid) {
      let reqObject = this.form.value;
      if (Object.keys(this.data.reqData).length !== 0) {
        reqObject._id = this.data.reqData._id;
      }
      reqObject.emergency_contact_userid = this.data.user_id;
      let that = this;
      that.uiSpinner.spin$.next(true);
      this.httpCall.httpPostCall(httproutes.EMERGENCY_CONTACT_SAVE, reqObject).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.uiSpinner.spin$.next(false);
          that.dialogRef.close();
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }
}

/*
    Document Update form
*/
@Component({
  selector: 'documentupload-form',
  templateUrl: './documentupload-form.html',
  styleUrls: ['./employee-view.component.scss']
})
export class DocumentUpdateFrom {
  // public db_Doc_types: any;
  //db_Doc_types
  variablesdb_Doc_types: any = [];
  db_Doc_types: any = this.variablesdb_Doc_types.slice();
  public form: FormGroup;
  cardImageBase64_mobile: any;
  imageError: any;
  isImageSaved: any;
  change_mobile_pic: boolean = false;
  cardImageBase64: any;
  showHideDate: boolean = false;
  filepath: any;
  isPublicDocument: boolean = false;
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon: string;
  constructor (public dialogRef: MatDialogRef<DocumentUpdateFrom>, private modeService: ModeDetectService, public mostusedservice: Mostusedservice,
    private formBuilder: FormBuilder, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService,
    public employeeservice: EmployeeService, public httpCall: HttpCall, @Inject(MAT_DIALOG_DATA) public data: any) {

    let that = this;


    if (Object.keys(data.reqData).length === 0) {
      this.form = this.formBuilder.group({
        userdocument_type_id: ['', Validators.required],
        userdocument_expire_date: ['', Validators.required],
        show_on_qrcode_scan: [false]
      });
    } else {
      if (data.reqData.show_on_qrcode_scan) {
        that.isPublicDocument = true;
      } else {
        that.isPublicDocument = false;
      }

      this.form = this.formBuilder.group({
        userdocument_type_id: [data.reqData.userdocument_type_id, Validators.required],
        show_on_qrcode_scan: [data.reqData.show_on_qrcode_scan, Validators.required],
        userdocument_expire_date: [new Date(data.reqData.userdocument_expire_date * 1000)],
      });
    }



    this.mostusedservice.getAllDocumentType().subscribe(function (data) {
      if (data.status) {
        // that.db_Doc_types = data.data;
        that.variablesdb_Doc_types = data.data;
        that.db_Doc_types = that.variablesdb_Doc_types.slice();
        if (Object.keys(that.data.reqData).length !== 0) {
          that.showHideExpirationDate(that.data.reqData.userdocument_type_id);
        }
      }
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';

    if (this.mode == 'off') {

      this.backIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE;


    } else {

      this.backIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE;

      } else {
        this.mode = 'on';
        this.backIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;


      }

    });
  }

  showHideExpirationDate(event: any) {
    let found = this.db_Doc_types.find((element: any) => element._id == event);
    this.showHideDate = found.is_expiration;
    if (this.showHideDate) {
      this.form.get('userdocument_expire_date')!.setValidators([Validators.required]);
      this.form.get('userdocument_expire_date')!.updateValueAndValidity();
    }
  }

  /*
    File select - Upload document
  */
  fileChangeEvent(fileInput: any) {
    this.imageError = null;
    commonFileChangeEvent(fileInput, 'all').then((result: any) => {
      if (result.status) {
        this.filepath = result.filepath;
        this.cardImageBase64 = result.base64;
        this.isImageSaved = true;
      } else {
        this.imageError = result.message;
        this.snackbarservice.openSnackBar(result.message, "error");
      }
    });

  }

  /*
    Save Document
  */
  saveData() {
    let element = this.form.value;
    let switch_value: string;
    if (element.show_on_qrcode_scan) {
      switch_value = "true";
    } else {
      switch_value = "false";
    }

    const formData = new FormData();

    element.userdocument_expire_date = element.userdocument_expire_date ? element.userdocument_expire_date.getTime() / 1000 : 0;
    formData.append('reqObject', JSON.stringify(element));
    formData.append('user_id', this.data.user_id);
    formData.append('show_on_qrcode_scan', switch_value);

    formData.append('file', this.filepath);
    let that = this;

    that.uiSpinner.spin$.next(true);
    if (Object.keys(that.data.reqData).length === 0) {
      this.employeeservice.employeeDocumentUpdate(formData).subscribe(function (data_doc) {
        if (data_doc.status) {
          that.snackbarservice.openSnackBar(data_doc.message, "success");
          that.dialogRef.close();
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(data_doc.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    } else {
      formData.append('_id', that.data.reqData._id);
      that.httpCall.httpPostCall(httproutes.TEAM_DOCUMENT_EDIT, formData).subscribe(function (params) {
        if (params.status) {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.dialogRef.close();
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }
  }
}

@Component({
  selector: 'app-user-document-history',
  templateUrl: './userdocument-history.html',
  styleUrls: ['./employee-view.component.scss']
})
export class UserDocumentHistoryComponent implements OnInit {
  dtOptions: any = {};
  locallanguage: any;
  tmp_Location_History_Listing_Date: any;
  tmp_Location_History_Listing_Action: any;
  tmp_Location_History_Listing_Name: any;

  All_Active: string = '';
  All_Inctive: string = '';

  Document: string = '';
  Document_Expiration: string = '';

  action_taken_from: any;
  mobile_all: any;
  web_all: any;
  iframe_all: any;
  mode: any;
  backIcon: string;
  subscription: Subscription;

  constructor (public httpCall: HttpCall, private modeService: ModeDetectService, public dialogRef: MatDialogRef<UserDocumentHistoryComponent>, private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService, public sb: Snackbarservice) {
    let that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      that.tmp_Location_History_Listing_Date = that.translate.instant('Location_History_Listing_Date');
      that.tmp_Location_History_Listing_Action = that.translate.instant('Location_History_Listing_Action');
      that.tmp_Location_History_Listing_Name = that.translate.instant('Location_History_Listing_Name');
      that.All_Active = that.translate.instant('All_Active');
      that.All_Inctive = that.translate.instant('All_Inctive');

      that.Document = that.translate.instant('Employee-form-Document');
      that.Document_Expiration = that.translate.instant('Employee-form-Document-Expiration');

      that.action_taken_from = that.translate.instant('action_taken_from');
      that.mobile_all = that.translate.instant('mobile_all');
      that.web_all = that.translate.instant('web_all');
      that.iframe_all = that.translate.instant('iframe_all');
    });
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      "order": [[0, "desc"]],
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback: any) => {
        dataTablesParameters.user_id = data.user_id;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.SPONSOR_PORTAL_GET_USER_DOCUMENT_HISTORY_DATATABLES,
            dataTablesParameters, { headers: headers }
          ).subscribe(resp => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },
      columns: that.getColumName(),
    };



    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';

    if (this.mode == 'off') {

      this.backIcon = icon.CANCLE;


    } else {

      this.backIcon = icon.CANCLE_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.CANCLE;

      } else {
        this.mode = 'on';
        this.backIcon = icon.CANCLE_WHITE;

      }

    });
  }
  ngOnInit(): void {

  }

  getColumName() {
    let that = this;
    return [
      {
        title: this.tmp_Location_History_Listing_Date,
        defaultContent: "",
        render: function (data: any, type: any, full: any) {
          return MMDDYYYY_formet(full.created_at);
        },
      },
      {
        title: this.tmp_Location_History_Listing_Action,
        data: 'action',
        defaultContent: ""
      },
      {
        title: this.tmp_Location_History_Listing_Name,
        data: 'created_by',
        defaultContent: "",
      },
      {
        title: that.action_taken_from,
        defaultContent: "",
        render: function (data: any, type: any, full: any) {
          if (full.taken_device == "Mobile") {
            return that.mobile_all;
          } else if (full.taken_device == "Web") {
            return that.web_all;
          } else if (full.taken_device == "iFrame") {
            return that.iframe_all;
          } else {
            return that.web_all;
          }
        }
      },
      {
        title: '',
        class: "none",
        defaultContent: "",
        render: function (data: any, type: any, full: any) {
          let html = `<table class="cust-table" >
                    <tr class="cust-backgroud-color">
                      <th>`+ that.Document + `</th>
                      <th>`+ that.Document_Expiration + `</th>
                    </tr><tr> 
                    <td>`+ full.document_name + `</td>
                    <td>`+ MMDDYYYY(full.userdocument_expire_date) + `</td>
                  </tr>
            </table>`;
          return html;
        }
      },
    ];
  }
}