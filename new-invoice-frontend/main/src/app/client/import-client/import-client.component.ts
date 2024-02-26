import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { AdvanceTable, RoleModel, UserModel } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { ClientService } from '../client.service';

@Component({
  selector: 'app-import-client',
  templateUrl: './import-client.component.html',
  styleUrls: ['./import-client.component.scss']
})
export class ImportClientComponent {
  action: string;
  dialogTitle: string;
  currrent_tab = 0;
  advanceTable: AdvanceTable;
  variablesRoleList: Array<RoleModel> = [];
  roleList: Array<RoleModel> = this.variablesRoleList.slice();
  titleMessage = '';
  userList: Array<UserModel> = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor (
    public dialogRef: MatDialogRef<ImportClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: ClientService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: ClientService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    console.log('data', data);
    this.currrent_tab = data;
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

  downloadImport() {
    this.dialogRef.close();

    return saveAs('./assets/files/clientimport.xlsx', 'clientimport.xlsx');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
