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
import { DepartmentFormComponent } from '../../employeesettings/department-list/department-form/department-form.component';
import { SettingsService } from '../../settings.service';

@Component({
  selector: 'app-cost-code-form',
  templateUrl: './cost-code-form.component.html',
  styleUrls: ['./cost-code-form.component.scss'],
})
export class CostCodeFormComponent {
  action: string;
  dialogTitle: string;
  costcodesave!: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];
  invoice_logo = icon.INVOICE_LOGO;

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  constructor (
    public dialogRef: MatDialogRef<DepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    this.costcodesave = new FormGroup({
      cost_code: new FormControl('', [Validators.required]),
      division: new FormControl('', [Validators.required]),
      description: new FormControl(''),
    });

    if (this.data) {
      this.costcodesave = new FormGroup({
        cost_code: new FormControl(this.data.cost_code),
        division: new FormControl(this.data.division),
        description: new FormControl(this.data.description),
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
    if (this.costcodesave.valid) {
      const requestObject = this.costcodesave.value;
      requestObject.module = 'Invoice';
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.saveCostCode(requestObject);
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

  onNoClick(): void {
    this.dialogRef.close();
  }
  public confirmAdd(): void {
    this.advanceTableService.addAdvanceTable(this.costcodesave.getRawValue());
  }
}
