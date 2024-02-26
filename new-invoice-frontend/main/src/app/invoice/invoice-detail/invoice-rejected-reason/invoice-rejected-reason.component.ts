import { Component, Inject } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { icon } from 'src/consts/icon';
import { DialogData } from 'src/app/vendors/vendor-report/vendor-report.component';

@Component({
  selector: 'app-invoice-rejected-reason',
  templateUrl: './invoice-rejected-reason.component.html',
  styleUrls: ['./invoice-rejected-reason.component.scss']
})
export class InvoiceRejectedReasonComponent {
  form!: UntypedFormGroup;
  hide = true;
  title = 'Reject Reason';

  constructor (public dialogRef: MatDialogRef<InvoiceRejectedReasonComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private commonService: CommonService, private snackBar: MatSnackBar, private router: Router, public uiSpinner: UiSpinnerService,
    private formBuilder: FormBuilder, public route: ActivatedRoute) {
    this.form = this.formBuilder.group({
      reject_reason: ['', Validators.required],
    });
  }

  async saveReason() {
    if (this.form.valid) {
      const formValues = this.form.value;
      this.dialogRef.close({ status: true, reject_reason: formValues.reject_reason });
    }
  }
}