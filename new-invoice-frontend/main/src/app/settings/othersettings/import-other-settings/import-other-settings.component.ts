import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { AdvanceTable } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { SettingsService } from '../../settings.service';
import * as saveAs from 'file-saver';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-import-other-settings',
  templateUrl: './import-other-settings.component.html',
  styleUrls: ['./import-other-settings.component.scss'],
})
export class ImportOtherSettingsComponent {
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
    public dialogRef: MatDialogRef<ImportOtherSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService
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
    if (this.currrent_tab == 'Terms') {
      return saveAs('./assets/files/importterms.xlsx', 'importterms.xlsx');
    } else if (this.currrent_tab == 'Tax rate') {
      return saveAs(
        './assets/files/importtax_rate.xlsx',
        'importtax_rate.xlsx'
      );
    } else if (this.currrent_tab == 'Documents') {
      return saveAs(
        './assets/files/importdocument.xlsx',
        'importdocument.xlsx'
      );
    } else if (this.currrent_tab == 'Vendor type') {
      return saveAs(
        './assets/files/importvendortype.xlsx',
        'importvendortype.xlsx'
      );
    } else if (this.currrent_tab == 'Class name') {
      return saveAs('./assets/files/importclassname.xlsx', 'importclassname.xlsx');
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
