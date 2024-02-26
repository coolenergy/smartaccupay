import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { showNotification } from 'src/consts/utils';
import { AdvanceTable } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-exist-list',
  templateUrl: './user-exist-list.component.html',
  styleUrls: ['./user-exist-list.component.scss']
})
export class UserExistListComponent extends UnsubscribeOnDestroyAdapter {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];
  exitData: any = [];
  button_show: boolean;
  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  data_import: any = [];
  title = 'Import User';

  constructor (
    public dialogRef: MatDialogRef<UserExistListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: UserService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public UserService: UserService,
    private commonService: CommonService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    this.exitData = data.data.data;
    this.button_show = data.data.allow_import;
    this.currrent_tab = data.tab;
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.fName + ' ' + data.advanceTable.lName;
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    }
  }

  async import() {
    this.uiSpinner.spin$.next(true);
    const userData = [];
    for (let i = 0; i < this.exitData.length; i++) {
      userData.push(this.exitData[i].data);
    }
    this.data_import = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.IMPORT_USER, { data: userData });
    this.uiSpinner.spin$.next(false);
    if (this.data_import.status) {
      this.dialogRef.close({ module: this.currrent_tab });
      showNotification(this.snackBar, this.data_import.message, 'success');
    } else {
      showNotification(this.snackBar, this.data_import.message, 'error');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

