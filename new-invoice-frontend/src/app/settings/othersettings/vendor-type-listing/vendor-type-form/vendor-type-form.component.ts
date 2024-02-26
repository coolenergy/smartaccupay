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
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../../settings.service';

@Component({
  selector: 'app-vendor-type-form',
  templateUrl: './vendor-type-form.component.html',
  styleUrls: ['./vendor-type-form.component.scss'],
})
export class VendorTypeFormComponent {
  action: string;
  dialogTitle: string;
  vendortypeInfo!: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor (
    public dialogRef: MatDialogRef<VendorTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    this.vendortypeInfo = new FormGroup({
      name: new FormControl('', [Validators.required]),
    });
    if (this.data) {
      this.vendortypeInfo = new FormGroup({
        name: new FormControl(this.data.name, [Validators.required]),
      });
    }

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
  formControl = new UntypedFormControl('', [
    Validators.required, // Validators.email,
  ]);
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
        ? 'Not a valid email'
        : '';
  }

  async submit() {
    if (this.vendortypeInfo.valid) {
      const requestObject = this.vendortypeInfo.value;
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.saveVendorType(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.dialogRef.close({ status: true, data: requestObject.name });
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    this.advanceTableService.addAdvanceTable(this.vendortypeInfo.getRawValue());
  }
}
