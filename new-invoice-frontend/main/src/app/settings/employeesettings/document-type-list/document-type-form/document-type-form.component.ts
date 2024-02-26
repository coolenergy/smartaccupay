import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserRestoreFormComponent } from 'src/app/users/user-restore-form/user-restore-form.component';
import { AdvanceTable } from 'src/app/users/user.model';
import { UserService } from 'src/app/users/user.service';
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../../settings.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { icon } from 'src/consts/icon';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-document-type-form',
  templateUrl: './document-type-form.component.html',
  styleUrls: ['./document-type-form.component.scss'],
})
export class DocumentTypeFormComponent {
  action: string;
  dialogTitle: string;
  DocumentInfo: UntypedFormGroup;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  title = this.translate.instant('SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.DOCUMENT_TYPE');
  constructor (
    public dialogRef: MatDialogRef<DocumentTypeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
  ) {
    this.DocumentInfo = new FormGroup({
      document_type_name: new FormControl('', [Validators.required]),
      is_expiration: new FormControl(false),
    });

    if (this.data) {
      this.DocumentInfo = new FormGroup({
        document_type_name: new FormControl(this.data.document_type_name, [
          Validators.required,
        ]),
        is_expiration: new FormControl(this.data.is_expiration ?? false),
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
    // this.DocumentInfo = this.createDocumentForm();
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
    if (this.DocumentInfo.valid) {
      const requestObject = this.DocumentInfo.value;
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);
      const data = await this.SettingsServices.saveDocumentType(requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.dialogRef.close({ status: true, data: { name: requestObject.document_type_name, is_expiration: requestObject.is_expiration, } });
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
    this.advanceTableService.addAdvanceTable(this.DocumentInfo.getRawValue());
  }
}
