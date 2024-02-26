/*
 *
 * Rovuk A/P
 *
 * This is the component which is used for display User profile
 * User card contains info like User Profile picture, User First name and Last name,
 * User Email, User Phone and User Job Title
 * 
 * User card shows user status Active/Inactive
 * 
 * On User card user can get Edit and Delete user action
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit, Input, Inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpCall } from './../../service/httpcall.service';
import { Snackbarservice } from './../../service/snack-bar-service';
import { Mostusedservice } from './../../service/mostused.service';
import { formatPhoneNumber } from "./../../service/utils";
import { httproutes, icon } from './../../consts';
import { Subscription } from 'rxjs';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { localstorageconstants } from 'src/app/consts/localstorageconstants';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { configdata } from 'src/environments/configData';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  allowOutsideClick: false,
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})

export class UserCardComponent implements OnInit {
  @Input() UserData: any;
  @Input() deleteTeamMember: any;
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  trashIcon: string = icon.ARCHIVE;
  editIcon: string;
  mode: any;
  subscription: Subscription;
  userComplianceIcon = icon.USER_COMPLIANCE_ICON;
  User_Self_Delete: string = "";
  First_User_Self_Delete: string = "";
  role_permission: any;
  role_permissions: any;
  defalut_image: string = icon.MALE_PLACEHOLDER;
  defalut_female_mage: string = icon.FEMALE_PLACEHOLDER;
  /*
    Constructor
  */
  constructor(private modeService: ModeDetectService, public translate: TranslateService, public mostusedservice: Mostusedservice,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public router: Router) {
    this.role_permissions = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.role_permission = userdata.role_permission.users;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
    } else {
      this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
      } else {
        this.mode = 'on';
        this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
      }
    });
    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      this.inacticve_word = this.translate.instant('project_setting_inactive');
      this.First_User_Self_Delete = this.translate.instant("First_User_Self_Delete");
      this.User_Self_Delete = this.translate.instant("User_Self_Delete");
    });
  }

  ngOnInit(): void { }

  /*
    View Employee Profile
  */
  viewEmployeePage(id: any) {
    this.router.navigateByUrl('/employee-view/' + id);
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  /*
    Delete Employee Action - Before delete any user this confirmation dialog asked.
  */

  deleteEmployeeAction() {
    let that = this;
    let userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    //  <!-- UserData.is_first || UserData._id == userdata.UserData._id -->
    if (this.UserData._id == userdata.UserData._id) {
      that.snackbarservice.openSnackBar(this.User_Self_Delete, "error");
    } else if (this.UserData.is_first) {
      that.snackbarservice.openSnackBar(this.First_User_Self_Delete, "error");
    } else {
      if (that.role_permission.Delete) {
        swalWithBootstrapButtons.fire({
          title: this.User_Card_Do_Want_Delete,
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: this.Compnay_Equipment_Delete_Yes,
          denyButtonText: this.Compnay_Equipment_Delete_No,
        }).then((result) => {
          if (result.isConfirmed) {
            this.httpCall.httpPostCall(httproutes.TEAM_DELETE, this.UserData).subscribe(function (params) {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.mostusedservice.userdeleteEmit();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
          }
        });
      }
    }
  }
}
@Component({
  selector: 'app-team-archive-card',
  templateUrl: './team-archive-card.html',
  styleUrls: ['./user-card.component.scss']
})
export class TeamArchiveCradComponent implements OnInit {
  @Input() UserData: any;
  @Input() deleteTeamMember: any;
  yesButton: string = '';
  noButton: string = '';
  recover_team_member: string = '';
  restoreIcon = icon.RESTORE;
  acticve_word: string = "";
  inacticve_word: string = "";
  defalut_image: string = icon.MALE_PLACEHOLDER;

  constructor(public httpCall: HttpCall, public uiSpinner: UiSpinnerService,
    public router: Router, public dialog: MatDialog,
    public translate: TranslateService, public snackbarservice: Snackbarservice) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.recover_team_member = this.translate.instant("recover_team_member");
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
      this.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      this.inacticve_word = this.translate.instant('project_setting_inactive');
    });
  }
  ngOnInit(): void { }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  recoverTeamMember(id: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: that.recover_team_member,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: that.yesButton,
      denyButtonText: that.noButton,
    }).then((result) => {
      if (result.isConfirmed) {
        const dialogRef = that.dialog.open(SelectUserRoleForm, {
          height: "350px",
          width: "600px",
          data: { user_id: id },
          disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => { });
      }
    });
  }
}

@Component({
  selector: "select-user-role-form",
  templateUrl: "./select-user-role-form.html",
  styleUrls: ["./user-card.component.scss"],
})
export class SelectUserRoleForm implements OnInit {
  variablesRoleList: any = [];
  roleList: any = this.variablesRoleList.slice();
  public statuss: any = configdata.superAdminStatus;
  userRoleInfo: FormGroup;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  saveIcon = icon.SAVE_WHITE;

  constructor(
    private modeService: ModeDetectService,
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    public dialogRef: MatDialogRef<SelectUserRoleForm>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackbarservice: Snackbarservice,
    public translate: TranslateService,
    public uiSpinner: UiSpinnerService,
    public router: Router
  ) {
    this.translate.stream([""]).subscribe((textarray) => { });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    this.userRoleInfo = this.formBuilder.group({
      userroleId: ["", Validators.required],
      userstatus: ["", Validators.required],
    });
    this.getAllRoles();
  }

  getAllRoles() {
    let that = this;
    that.httpCall
      .httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL)
      .subscribe(function (params) {
        if (params.status) {
          that.variablesRoleList = params.data;
          that.roleList = that.variablesRoleList.slice();

        }
      });
  }

  restoreUser() {
    let that = this;
    if (that.userRoleInfo.valid) {
      let requestObject = that.userRoleInfo.value;
      requestObject._id = that.data.user_id;
      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(httproutes.TEAM_RECOVER, requestObject)
        .subscribe((params) => {
          if (params.status) {
            that.dialogRef.close();
            that.snackbarservice.openSnackBar(params.message, "success");
            that.router.navigateByUrl("/employee-list");
            that.uiSpinner.spin$.next(false);
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
            that.uiSpinner.spin$.next(false);
          }
        });
    }
  }
}