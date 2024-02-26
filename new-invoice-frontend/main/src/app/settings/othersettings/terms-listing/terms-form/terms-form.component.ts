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
import { JobTitleFormComponent } from '../../../employeesettings/job-title-list/job-title-form/job-title-form.component';
import { SettingsService } from '../../../settings.service';

@Component({
  selector: 'app-terms-form',
  templateUrl: './terms-form.component.html',
  styleUrls: ['./terms-form.component.scss'],
})
export class TermsFormComponent {
  action: string;
  dialogTitle: string;
  TermsInfo!: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor (
    public dialogRef: MatDialogRef<JobTitleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    this.TermsInfo = new FormGroup({
      name: new FormControl('', [Validators.required]),
      due_days: new FormControl('', [Validators.required]),
      is_discount: new FormControl(false, []),
      discount: new FormControl('', []),
    });
    if (this.data) {
      this.TermsInfo = new FormGroup({
        name: new FormControl(this.data.name, [Validators.required]),
        due_days: new FormControl(this.data.due_days, [Validators.required]),
        is_discount: new FormControl(this.data.is_discount, []),
        discount: new FormControl(this.data.discount, []),
      });
      if (this.data.is_discount) {
        this.TermsInfo.get('discount')?.setValidators([Validators.required]);
      } else {
        this.TermsInfo.get('discount')?.clearValidators();
      }
      this.TermsInfo.get('discount')?.updateValueAndValidity();
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
    if (this.TermsInfo.valid) {
      const requestObject = this.TermsInfo.value;
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.saveTerms(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.dialogRef.close({ status: true, data: requestObject });
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  retainagePercentageChange(event: { charCode: number; }) {
    const values = this.TermsInfo.value;
    const pattern = /[^0-9.]/g;
    const digit = String.fromCharCode(event.charCode);
    const check_digit = digit.match(pattern);
    let check = check_digit === null;
    if (check) {
      const percentage = Number(`${values.discount}${digit}`);
      if (percentage > 100) {
        check = false;
        showNotification(
          this.snackBar,
          'Percentage must be less then 100.',
          'error'
        );
      }
    }
    return check;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    this.advanceTableService.addAdvanceTable(this.TermsInfo.getRawValue());
  }
}
