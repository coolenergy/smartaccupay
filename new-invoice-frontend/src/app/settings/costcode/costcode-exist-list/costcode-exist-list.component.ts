import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../settings.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { CostCodeModel } from '../../settings.model';


@Component({
  selector: 'app-costcode-exist-list',
  templateUrl: './costcode-exist-list.component.html',
  styleUrls: ['./costcode-exist-list.component.scss']
})
export class CostcodeExistListComponent extends UnsubscribeOnDestroyAdapter {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  costcodeService?: SettingsService;
  CostCodeModel!: CostCodeModel;
  variablesRoleList: any = [];
  exitData: any = [];
  button_show: boolean;
  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  data_import: any = [];
  title = 'Import Costcode';

  constructor(
    public dialogRef: MatDialogRef<CostcodeExistListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public SettingsService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
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
        data.CostCodeModel.fName + ' ' + data.CostCodeModel.lName;
      this.CostCodeModel = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as CostCodeModel;
      this.CostCodeModel = new CostCodeModel(blankObject);
    }
  }

  async import() {
    this.uiSpinner.spin$.next(true);
    this.data_import = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SETTINGS_IMPORT_COSTCODE_DATA, this.exitData);

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

