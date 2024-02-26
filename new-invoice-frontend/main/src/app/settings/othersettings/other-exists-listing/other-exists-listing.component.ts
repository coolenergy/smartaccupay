import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { AdvanceTable } from 'src/app/users/user.model';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { showNotification } from 'src/consts/utils';
import { ExistListingComponent } from '../../employeesettings/exist-listing/exist-listing.component';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-other-exists-listing',
  templateUrl: './other-exists-listing.component.html',
  styleUrls: ['./other-exists-listing.component.scss']
})
export class OtherExistsListingComponent extends UnsubscribeOnDestroyAdapter {
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
  title = '';

  constructor (
    public dialogRef: MatDialogRef<ExistListingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
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
    if (this.currrent_tab == "Terms") {
      this.data_import = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_TERMS, this.exitData);
    } else if (this.currrent_tab == 'Tax rate') {
      this.data_import =
        await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_TEXT_RATE, this.exitData);
    } else if (this.currrent_tab == 'Documents') {
      this.data_import =
        await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_DOCUMENT, this.exitData);
    } else if (this.currrent_tab == 'Vendor type') {
      this.data_import =
        await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_VENDOR_TYPE, this.exitData);
    } else if (this.currrent_tab == 'Class name') {
      this.data_import =
        await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.OTHER_SETTINGS_IMPORT_CLASS, this.exitData);
    }
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
