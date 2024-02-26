import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ClientJobModel } from 'src/app/client/client.model';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { ClassNameModel } from 'src/app/settings/settings.model';
import { UserModel } from 'src/app/users/user.model';
import { VendorModel } from 'src/app/vendors/vendor.model';
import { icon } from 'src/consts/icon';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-select-report-value',
  templateUrl: './select-report-value.component.html',
  styleUrls: ['./select-report-value.component.scss']
})
export class SelectReportValueComponent implements OnInit {
  form!: UntypedFormGroup;
  hide = true;
  variablesVendorList: Array<VendorModel> = [];
  vendorList: Array<VendorModel> = this.variablesVendorList.slice();

  variablesUserList: Array<UserModel> = [];
  userList: Array<UserModel> = this.variablesUserList.slice();

  variablesClassNameList: Array<ClassNameModel> = [];
  classNameList: Array<ClassNameModel> = this.variablesClassNameList.slice();

  variablesClientJob: Array<ClientJobModel> = [];
  clientList: Array<ClientJobModel> = this.variablesClientJob.slice();

  id: any;
  invoice_logo = icon.INVOICE_LOGO;
  reportType = configData.REPORT_TYPE;

  constructor (public dialogRef: MatDialogRef<SelectReportValueComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public uiSpinner: UiSpinnerService, private formBuilder: FormBuilder, public route: ActivatedRoute) {
    this.form = this.formBuilder.group({
      All_Vendors: [true],
      vendor_ids: [[]],
      All_Users: [true],
      assign_to_ids: [[]],
      All_ClassNames: [true],
      class_name_ids: [[]],
      All_JobClients: [true],
      job_client_name_ids: [[]],
    });
    if (data.title == this.reportType.reportVendor || data.title == this.reportType.openVendor) {
      this.variablesVendorList = data.vendorList;
      this.vendorList = this.variablesVendorList.slice();

      this.form.get("vendor_ids")?.setValidators([Validators.required]);
      this.form.get("vendor_ids")?.updateValueAndValidity();
      this.form.get("vendor_ids")?.setValue(this.vendorList.map((el) => el._id));
    } else if (data.title == this.reportType.openApprover) {
      this.variablesUserList = data.userList;
      this.userList = this.variablesUserList.slice();

      this.form.get("assign_to_ids")?.setValidators([Validators.required]);
      this.form.get("assign_to_ids")?.updateValueAndValidity();
      this.form.get("assign_to_ids")?.setValue(this.userList.map((el) => el._id));
    } else if (data.title == this.reportType.openClass) {
      this.variablesClassNameList = data.classNameList;
      this.classNameList = this.variablesClassNameList.slice();

      this.form.get("class_name_ids")?.setValidators([Validators.required]);
      this.form.get("class_name_ids")?.updateValueAndValidity();
      this.form.get("class_name_ids")?.setValue(this.classNameList.map((el) => el._id));
    } else if (data.title == this.reportType.openClientJob) {
      this.variablesClientJob = data.clientList;
      this.clientList = this.variablesClientJob.slice();

      this.form.get("job_client_name_ids")?.setValidators([Validators.required]);
      this.form.get("job_client_name_ids")?.updateValueAndValidity();
      this.form.get("job_client_name_ids")?.setValue(this.clientList.map((el) => el._id));
    }
  }

  ngOnInit() {
    const that = this;
    this.form.get("vendor_ids")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.vendorList.length) {
        that.form.get("All_Users")?.setValue(true);
      } else {
        that.form.get("All_Users")?.setValue(false);
      }
    });
    this.form.get("assign_to_ids")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.userList.length) {
        that.form.get("All_Vendors")?.setValue(true);
      } else {
        that.form.get("All_Vendors")?.setValue(false);
      }
    });
    this.form.get("class_name_ids")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.classNameList.length) {
        that.form.get("All_ClassNames")?.setValue(true);
      } else {
        that.form.get("All_ClassNames")?.setValue(false);
      }
    });
    this.form.get("job_client_name_ids")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.clientList.length) {
        that.form.get("All_JobClients")?.setValue(true);
      } else {
        that.form.get("All_JobClients")?.setValue(false);
      }
    });
  }

  onChangeValueAll_Vendors(params: any) {
    if (params.checked) {
      this.form.get("vendor_ids")?.setValue(this.vendorList.map((el) => el._id));
    } else {
      this.form.get("vendor_ids")?.setValue([]);
    }
  }

  onChangeValueAll_Users(params: any) {
    if (params.checked) {
      this.form.get("assign_to_ids")?.setValue(this.userList.map((el) => el._id));
    } else {
      this.form.get("assign_to_ids")?.setValue([]);
    }
  }

  onChangeValueAll_ClassNames(params: any) {
    if (params.checked) {
      this.form.get("class_name_ids")?.setValue(this.classNameList.map((el) => el._id));
    } else {
      this.form.get("class_name_ids")?.setValue([]);
    }
  }

  onChangeValueAll_JobClients(params: any) {
    if (params.checked) {
      this.form.get("job_client_name_ids")?.setValue(this.clientList.map((el) => el._id));
    } else {
      this.form.get("job_client_name_ids")?.setValue([]);
    }
  }

  async viewReport() {
    console.log("this.form.value: ", this.form.value);
    if (this.form.valid) {
      this.dialogRef.close({ status: true, data: this.form.value });
    }
  }
}
