import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { DepartmentFormComponent } from 'src/app/settings/employeesettings/department-list/department-form/department-form.component';
import { AdvanceTable, UserModel } from 'src/app/users/user.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { icon } from 'src/consts/icon';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { numberWithCommas, showNotification } from 'src/consts/utils';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-mail-form',
  templateUrl: './mail-form.component.html',
  styleUrls: ['./mail-form.component.scss'],
})
export class MailFormComponent {
  action: string;
  dialogTitle: string;
  mailInfo!: any;
  advanceTable: AdvanceTable;
  title = 'Mail';


  titleMessage = '';
  variablesUserList: Array<UserModel> = [];
  userList: Array<UserModel> = this.variablesUserList.slice();
  variablesUserToList: Array<UserModel> = [];
  usertoList: Array<UserModel> = this.variablesUserToList.slice();
  isDelete = 0;
  SmtpEmail: any;
  removable = true;
  addOnBlur = true;
  selectedUsers: Array<string> = [];
  selectedToUsers: Array<string> = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  constructor (
    public dialogRef: MatDialogRef<MailFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    public uiSpinner: UiSpinnerService,
    public commonService: CommonService
  ) {
    this.mailInfo = this.fb.group({
      to: [[], [Validators.required]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
      cc: [[], [Validators.required]],
    });
    const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.mailInfo.get("message")?.setValue(`
-----------------------------------------------------------------------------\n
${userData.companydata.companyname}\n
Vendor: ${data.vendor_data?.vendor_name ?? ''}\n
Invoice Number: ${data.invoice_no}\n
Total Amount: $${numberWithCommas(data.invoice_total_amount.toFixed(2))}`);

    this.getUser();
    this.getSmtpEmail();
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

  async getUser() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.GET_ALL_USER
    );
    if (data.status) {
      this.variablesUserList = data.data;
      this.userList = this.variablesUserList.slice();

      this.variablesUserToList = data.data;
      this.usertoList = this.variablesUserToList.slice();
    }
    const user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.mailInfo.get("cc")!.setValue([user_data.UserData.useremail]);
    this.selectedUsers.push(user_data.UserData.useremail);
  }
  getErrorMessage() {
    return this.formControl.hasError('required')
      ? 'Required field'
      : this.formControl.hasError('email')
        ? 'Not a valid email'
        : '';
  }

  onUserChange(event: any) {
    this.selectedUsers = event.value;
  }

  onUsertoChange(event: any) {
    this.selectedToUsers = event.value;
  }


  onUserCopyChange(event: any) {
    this.selectedUsers = event.value;
  }
  removeUseremail(user: string) {
    const index = this.selectedUsers.indexOf(user);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1);
      const tempUser = this.mailInfo.get('cc').value;
      tempUser.slice(index, 1);
      this.mailInfo.get('cc').setValue(tempUser);
    }
  }

  removeUserTOemail(user: string) {
    const index = this.selectedToUsers.indexOf(user);
    if (index !== -1) {
      this.selectedToUsers.splice(index, 1);
      const tempUser = this.mailInfo.get('to').value;
      tempUser.slice(index, 1);
      this.mailInfo.get('to').setValue(tempUser);
    }
  }

  async getSmtpEmail() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP
    );
    if (data.status) {
      this.SmtpEmail = data.data.tenant_smtp_username;
    }

  }

  async submit() {
    if (this.mailInfo.valid) {
      const requestObject = this.mailInfo.value;
      requestObject.pdf_url = 'https://www.orimi.com/pdf-test.pdf';
      if (this.data) {
        requestObject._id = this.data._id;
      }
      this.uiSpinner.spin$.next(true);

      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SEND_INVOICE_EMAIL, requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        location.reload();
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
    // this.advanceTableService.addAdvanceTable(this.mailInfo.getRawValue());
  }
}

