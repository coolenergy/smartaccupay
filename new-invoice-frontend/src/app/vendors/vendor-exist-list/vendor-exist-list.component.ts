import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { UserExistListComponent } from 'src/app/users/user-exist-list/user-exist-list.component';
import { AdvanceTable } from 'src/app/users/user.model';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { showNotification } from 'src/consts/utils';
import { VendorsService } from '../vendors.service';

@Component({
  selector: 'app-vendor-exist-list',
  templateUrl: './vendor-exist-list.component.html',
  styleUrls: ['./vendor-exist-list.component.scss']
})
export class VendorExistListComponent extends UnsubscribeOnDestroyAdapter
  implements OnInit {
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
  invoice_logo = icon.INVOICE_LOGO;
  data_import: any = [];
  title = 'Vendor Imaport';

  constructor (
    public dialogRef: MatDialogRef<UserExistListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: VendorsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public VendorsService: VendorsService,
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


  ngOnInit(): void {

  }

  async import() {
    this.uiSpinner.spin$.next(true);
    this.data_import = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.IMPORT_VENDOR, this.exitData);

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