import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { ImportUserComponent } from 'src/app/users/import-user/import-user.component';
import { AdvanceTable } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { VendorsService } from '../vendors.service';

@Component({
  selector: 'app-import-vendor',
  templateUrl: './import-vendor.component.html',
  styleUrls: ['./import-vendor.component.scss']
})
export class ImportVendorComponent {
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
    public dialogRef: MatDialogRef<ImportVendorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: VendorsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public VendorsService: VendorsService,
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
    return saveAs('./assets/files/importvendor.xlsx', 'importvendor.xlsx');
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
