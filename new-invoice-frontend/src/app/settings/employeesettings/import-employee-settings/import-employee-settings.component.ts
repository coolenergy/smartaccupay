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
  selector: 'app-import-employee-settings',
  templateUrl: './import-employee-settings.component.html',
  styleUrls: ['./import-employee-settings.component.scss'],
})
export class ImportEmployeeSettingsComponent {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  title = this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.OTHER_SETTINGS_MODULE.FILE_DOWNLOAD_INSTRUCTION');
  constructor (
    public dialogRef: MatDialogRef<ImportEmployeeSettingsComponent>,
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
    if (this.currrent_tab == 'document') {
      return saveAs(
        './assets/files/documenttypeimport.xlsx',
        'documenttypeimport.xlsx'
      );
    } else if (this.currrent_tab == 'department') {
      return saveAs(
        './assets/files/departmentimport.xlsx',
        'departmentimport.xlsx'
      );
    } else if (this.currrent_tab == 'jobtitle') {
      return saveAs(
        './assets/files/jobtitleimport.xlsx',
        'jobtitleimport.xlsx'
      );
    } else if (this.currrent_tab == 'jobtype') {
      return saveAs('./assets/files/jobtypeimport.xlsx', 'jobtypeimport.xlsx');
    } else if (this.currrent_tab == 'relationship') {
      return saveAs(
        './assets/files/relationshipimport.xlsx',
        'relationshipimport.xlsx'
      );
    } else if (this.currrent_tab == 'language') {
      return saveAs(
        './assets/files/languageimport.xlsx',
        'languageimport.xlsx'
      );
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
