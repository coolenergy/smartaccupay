import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification } from 'src/consts/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-rolesettings',
  templateUrl: './rolesettings.component.html',
  styleUrls: ['./rolesettings.component.scss'],
})
export class RolesettingsComponent {
  allRoles: any = [];
  roleName = '';
  constructor (private router: Router, public httpCall: HttpCall, private snackBar: MatSnackBar, private commonService: CommonService) { }

  ngOnInit() {
    this.getAllRoles();
  }

  async getAllRoles() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_ROLES_ALL);
    if (data.status) {
      this.allRoles = data.data;
    }
  }

  async saveData(role: any) {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTING_ROLES_SAVE, role);
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  onTabNameChanged(rName: any) {
    if (rName == 'Admin') {
      this.roleName = 'Admin';
    } else if (rName == 'Manager') {
      this.roleName = 'Admin Without SettingsModel';
    } else {
      this.roleName = '';
    }
  }

  changeAllProject(event: any, index: any, key_: any) {
    this.allRoles[index].role_permission[key_].Add = event.checked;
    this.allRoles[index].role_permission[key_].Edit = event.checked;
    this.allRoles[index].role_permission[key_].Delete = event.checked;
    this.allRoles[index].role_permission[key_].View = event.checked;
    /* if (key_ == 'vendor') {

      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'clientJob') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'invoice') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } else if (key_ == 'users') {
      this.allRoles[index].role_permission[key_].Restore = event.checked;
    } */
  }

  oneAllSettingChange(event: any, index: any, key_: any) {
    if (event.checked) {
      if (this.allRoles[index].role_permission[key_].Add && this.allRoles[index].role_permission[key_].Edit
        && this.allRoles[index].role_permission[key_].Delete && this.allRoles[index].role_permission[key_].View) {
        this.allRoles[index].role_permission[key_].All = event.checked;
      }
    } else {
      this.allRoles[index].role_permission[key_].All = event.checked;
    }
  }

  twoChangeAllProject(event: any, index: any, key_: any) {
    for (const [key, value] of Object.entries(
      this.allRoles[index].role_permission[key_]
    )) {
      if (key != 'All') {
        this.allRoles[index].role_permission[key_][key].Add = event.checked;
        this.allRoles[index].role_permission[key_][key].Delete = event.checked;
        this.allRoles[index].role_permission[key_][key].Edit = event.checked;
        this.allRoles[index].role_permission[key_][key].View = event.checked;
        if (key_ == 'vendor') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'clientJob') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'invoice') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        } else if (key_ == 'users') {
          this.allRoles[index].role_permission[key_].Restore = event.checked;
        }
      }
    }
  }

  back() {
    this.router.navigate([WEB_ROUTES.SIDEMENU_SETTINGS]);
  }
}
