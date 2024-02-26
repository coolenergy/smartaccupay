import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { ImportOtherSettingsComponent } from 'src/app/settings/othersettings/import-other-settings/import-other-settings.component';
import { SettingsService } from 'src/app/settings/settings.service';
import { icon } from 'src/consts/icon';
import { AdvanceTable } from '../user.model';
import { UserService } from '../user.service';

@Component({
  selector: 'app-import-user',
  templateUrl: './import-user.component.html',
  styleUrls: ['./import-user.component.scss']
})
export class ImportUserComponent {
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];
  action: string;
  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor(
    public dialogRef: MatDialogRef<ImportUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: UserService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public UserService: UserService,
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
    return saveAs('./assets/files/userimport.xlsx', 'userimport.xlsx');
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
