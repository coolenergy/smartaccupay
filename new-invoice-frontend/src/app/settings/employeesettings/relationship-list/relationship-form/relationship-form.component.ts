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
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../../settings.service';
import { JobTitleFormComponent } from '../../job-title-list/job-title-form/job-title-form.component';
import { icon } from 'src/consts/icon';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-relationship-form',
  templateUrl: './relationship-form.component.html',
  styleUrls: ['./relationship-form.component.scss'],
})
export class RelationshipFormComponent {
  action: string;
  dialogTitle: string;
  relationshipInfo!: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  title = this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.RELATIONSHIP');

  constructor (
    public dialogRef: MatDialogRef<JobTitleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
  ) {
    this.relationshipInfo = new FormGroup({
      relationship_name: new FormControl('', [Validators.required]),
    });
    const document_data = data.data;

    if (this.data) {
      this.relationshipInfo = new FormGroup({
        relationship_name: new FormControl(this.data.relationship_name, [
          Validators.required,
        ]),
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
    if (this.relationshipInfo.valid) {
      const requestObject = this.relationshipInfo.value;
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.saveRelatioship(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.dialogRef.close({ status: true, data: requestObject.relationship_name });
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
    this.advanceTableService.addAdvanceTable(
      this.relationshipInfo.getRawValue()
    );
  }
}
