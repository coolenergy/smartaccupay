import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/authentication/authentication.service';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { DialogData } from 'src/app/vendors/vendor-report/vendor-report.component';
import { CompanyModel } from 'src/consts/common.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification } from 'src/consts/utils';

@Component({
  selector: 'app-switch-company',
  templateUrl: './switch-company.component.html',
  styleUrls: ['./switch-company.component.scss']
})
export class SwitchCompanyComponent implements OnInit {
  companyList: Array<CompanyModel> = [];
  companyCode = '';
  isLoading = true;
  form!: UntypedFormGroup;
  hide = true;
  showCompanyList = true;
  selectedCompany!: CompanyModel;
  removable = true;
  title = 'Choose Organization';

  constructor (public dialogRef: MatDialogRef<SwitchCompanyComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private commonService: CommonService, private snackBar: MatSnackBar, private router: Router, public uiSpinner: UiSpinnerService,
    private formBuilder: FormBuilder, private authenticationService: AuthenticationService) {
    this.form = this.formBuilder.group({
      password: ["", Validators.required],
    });
  }

  async ngOnInit() {
    const user_data = localStorage.getItem(localstorageconstants.USERDATA) ?? '';
    if (user_data !== '') {

      const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');
      this.companyCode = userData.companydata.companycode;
      const requestObject = {
        useremail: userData.UserData.useremail
      };
      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.GET_MY_COMPANY_LIST, requestObject);
      this.isLoading = false;
      if (data.status) {
        this.companyList = data.data;
      }
    } else {
      this.isLoading = false;
    }
  }

  selectCompany(company: CompanyModel) {
    if (this.companyCode === company.companycode) {
      showNotification(this.snackBar, 'You are already logged-in company.', 'error');
    } else {
      this.showCompanyList = false;
      this.selectedCompany = company;
    }
  }

  removeCompany() {
    this.showCompanyList = true;
  }

  async userLogin() {
    if (this.form.valid) {
      this.uiSpinner.spin$.next(true);
      const userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '{}');

      const formValues = this.form.value;
      formValues.useremail = userData.UserData.useremail;
      formValues.companycode = this.selectedCompany.companycode;

      const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.USER_LOGIN, formValues);
      this.uiSpinner.spin$.next(false);
      if (data.status) {
        this.dialogRef.close();
        showNotification(this.snackBar, data.message, 'success');
        this.authenticationService.changeTokenValue(data.data.token);
        localStorage.setItem(localstorageconstants.INVOICE_TOKEN, data.data.token);
        localStorage.setItem(localstorageconstants.COMPANYID, data.data.companydata._id);
        localStorage.setItem(localstorageconstants.USERDATA, JSON.stringify(data.data));

        if (data.data.UserData.useris_password_temp == true) {
          this.router.navigate([WEB_ROUTES.FORCEFULLY_CHANGE_PASSWORD]);
        } else {
          console.log("sagar: ", window.location.pathname, "and", WEB_ROUTES.DASHBOARD, "====", window.location.pathname === WEB_ROUTES.DASHBOARD);
          if (window.location.pathname === WEB_ROUTES.DASHBOARD) {
            setTimeout(() => {
              location.reload();
            }, 200);
          } else {
            this.router.navigate([WEB_ROUTES.DASHBOARD]);
            setTimeout(() => {
              location.reload();
            }, 200);
          }
        }

      } else {
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }
}
