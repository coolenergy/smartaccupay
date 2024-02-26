import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as saveAs from 'file-saver';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { AdvanceTable } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-import-costcode-settings',
  templateUrl: './import-costcode-settings.component.html',
  styleUrls: ['./import-costcode-settings.component.scss'],
})
export class ImportCostcodeSettingsComponent {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor (
    public dialogRef: MatDialogRef<ImportCostcodeSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService
  ) {
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
    return saveAs('./assets/files/importcostcode.xlsx', 'importcostcode.xlsx');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
