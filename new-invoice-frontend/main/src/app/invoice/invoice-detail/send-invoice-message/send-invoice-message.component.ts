import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SwitchCompanyComponent } from 'src/app/layout/header/switch-company/switch-company.component';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { UserModel } from 'src/app/users/user.model';
import { DialogData } from 'src/app/vendors/vendor-report/vendor-report.component';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-send-invoice-message',
  templateUrl: './send-invoice-message.component.html',
  styleUrls: ['./send-invoice-message.component.scss']
})
export class SendInvoiceMessageComponent implements OnInit {
  isLoading = true;
  form!: UntypedFormGroup;
  hide = true;
  variablesUserList: any = [];
  userList: Array<UserModel> = this.variablesUserList.slice();
  id: any;
  title = 'Send Message';

  constructor (public dialogRef: MatDialogRef<SwitchCompanyComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private commonService: CommonService, private snackBar: MatSnackBar, private router: Router, public uiSpinner: UiSpinnerService,
    private formBuilder: FormBuilder, public route: ActivatedRoute) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.form = this.formBuilder.group({
      users: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  async ngOnInit() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER);
    this.isLoading = false;
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();
    }
    this.isLoading = false;
  }

  async sendMessage() {
    if (this.form.valid) {
      this.uiSpinner.spin$.next(true);

      const formValues = this.form.value;
      formValues.invoice_id = this.id;
      formValues.is_first = true;
      formValues.users = [formValues.users];

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SEND_INVOICE_MESSAGE, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        this.dialogRef.close();
        showNotification(this.snackBar, data.message, 'success');
      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }
}
