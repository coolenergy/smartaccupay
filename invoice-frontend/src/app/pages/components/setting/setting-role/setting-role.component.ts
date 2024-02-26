import { Component, OnInit } from '@angular/core';
import { httproutes, icon } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';

@Component({
  selector: 'app-setting-role',
  templateUrl: './setting-role.component.html',
  styleUrls: ['./setting-role.component.scss']
})
export class SettingRoleComponent implements OnInit {
  allRoles: any = [];
  roleName: any;
  saveIcon = icon.SAVE_WHITE;

  constructor(public httpCall: HttpCall, public snackbarservice: Snackbarservice) {
  }

  ngOnInit(): void {
    this.getAllRoles();
  }

  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }

  saveData(role: any) {
    let that = this;
    this.httpCall.httpPostCall(httproutes.PORTAL_SETTING_ROLES_SAVE, role).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
      }
    });
  }

  onTabNameChanged(rName: any) {

    if (rName == "Admin") {
      this.roleName = "Admin";
    } else if (rName == "Manager") {
      this.roleName = "Admin Without Settings";
    } else {
      this.roleName = "";
    }
  }

  changeAllProject(event: any, index: any, key_: any) {
    this.allRoles[index].role_permission[key_].Add = event.checked;
    this.allRoles[index].role_permission[key_].Edit = event.checked;
    this.allRoles[index].role_permission[key_].Delete = event.checked;
    this.allRoles[index].role_permission[key_].View = event.checked;
    if (key_ == 'projects') {
      this.allRoles[index].role_permission[key_].Settings = event.checked;
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'changeOrders') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'vendors') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'emailTemplates') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    }
  }

  oneAllSettingChange(event: any, index: any, key_: any) {
    if (event.checked) {
      if (this.allRoles[index].role_permission[key_].Add && this.allRoles[index].role_permission[key_].Edit
        && this.allRoles[index].role_permission[key_].Delete && this.allRoles[index].role_permission[key_].View) {
        if (key_ == 'projects') {
          if (this.allRoles[index].role_permission[key_].Settings && this.allRoles[index].role_permission[key_].Restore) {
            this.allRoles[index].role_permission[key_].All = event.checked;
          }
        } else if (key_ == 'changeOrders') {
          if (this.allRoles[index].role_permission[key_].Restore) {
            this.allRoles[index].role_permission[key_].All = event.checked;
          }
        } else if (key_ == 'vendors') {
          if (this.allRoles[index].role_permission[key_].Restore) {
            this.allRoles[index].role_permission[key_].All = event.checked;
          }
        } else if (key_ == 'emailTemplates') {
          if (this.allRoles[index].role_permission[key_].Restore) {
            this.allRoles[index].role_permission[key_].All = event.checked;
          }
        } else {
          this.allRoles[index].role_permission[key_].All = event.checked;
        }
      }
    } else {
      this.allRoles[index].role_permission[key_].All = event.checked;
    }
  }

  twoChangeAllProject(event: any, index: any, key_: any) {
    for (const [key, value] of Object.entries(this.allRoles[index].role_permission[key_])) {
      if (key != "All") {
        this.allRoles[index].role_permission[key_][key].Add = event.checked;
        this.allRoles[index].role_permission[key_][key].Delete = event.checked;
        this.allRoles[index].role_permission[key_][key].Edit = event.checked;
        this.allRoles[index].role_permission[key_][key].View = event.checked;
        if (key_ == 'projects') {
          this.allRoles[index].role_permission[key_].Settings = event.checked;
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'changeOrders') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'vendors') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'emailTemplates') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        }
      }
    }
  }
}
