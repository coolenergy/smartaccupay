import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'src/app/services/common.service';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { WEB_ROUTES } from 'src/consts/routes';
import { showNotification, swalWithBootstrapButtons, swalWithBootstrapTwoButtons, } from 'src/consts/utils';
import { ClientService } from '../client.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { RolePermission } from 'src/consts/common.model';
import { CostCodeModel, CountryModel, TermModel } from 'src/app/settings/settings.model';
import { UserModel } from 'src/app/users/user.model';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss'],
})
export class ClientFormComponent {
  clientForm: UntypedFormGroup;
  hide = true;
  agree = false;
  customForm?: UntypedFormGroup;
  variablestermList: Array<TermModel> = [];
  termsList: Array<TermModel> = this.variablestermList.slice();
  variablecostcodeList: Array<CostCodeModel> = [];
  costcodeList: Array<CostCodeModel> = this.variablecostcodeList.slice();
  variableapproverList: Array<UserModel> = [];
  approverList: Array<UserModel> = this.variableapproverList.slice();
  countryList: Array<CountryModel> = [{ _id: 'USA', name: 'USA' }];
  id: any;
  submitting_text = '';
  titleMessage = '';
  show = false;
  role_permission!: RolePermission;
  is_delete: any;

  isHideEditActionQBD = false;
  isHideArchiveActionQBD = false;

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
    public route: ActivatedRoute,
    public clientService: ClientService,
    private sanitiser: DomSanitizer,
    public commonService: CommonService
  ) {
    this.id = this.route.snapshot.queryParamMap.get('_id') ?? '';
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).role_permission;
    this.clientForm = this.fb.group({
      client_name: ['', [Validators.required]],
      client_number: [''],
      client_email: ['', [Validators.required, Validators.email, Validators.minLength(5)],],
      client_cost_cost_id: [''],
      approver_id: [''],
      client_status: [''],
      client_notes: [''],
    });
    this.getapprover();
    this.getCompanyTenants();
    this.getcostcode();
    if (this.id) {
      this.getOneClient();
    }
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      if (data.data.is_quickbooks_desktop) {
        if (this.role_permission.clientJob.Edit) {
          this.isHideEditActionQBD = true;
        } else {
          this.isHideEditActionQBD = false;
        }
        if (this.role_permission.clientJob.Delete) {
          this.isHideArchiveActionQBD = true;
        } else {
          this.isHideArchiveActionQBD = false;
        }
      }
    }
  }

  async getOneClient() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_GET_ONE, { _id: this.id });
    if (data.status) {
      const clientData = data.data;
      this.is_delete = clientData.is_delete;
      this.clientForm = this.fb.group({
        client_name: [clientData.client_name, [Validators.required]],
        client_number: [clientData.client_number],
        client_email: [clientData.client_email, [Validators.required, Validators.email, Validators.minLength(5)],],
        client_cost_cost_id: [clientData.client_cost_cost_id],
        approver_id: [clientData.approver_id],
        client_status: [clientData.client_status],
        client_notes: [clientData.client_notes],
      });

      this.clientForm.markAllAsTouched();
    }
  }

  async getcostcode() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_COSTCODE);
    if (data.status) {
      this.variablecostcodeList = data.data;
      this.costcodeList = this.variablecostcodeList.slice();
    }
  }

  async getapprover() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_ALL_USER);
    // const data = await this.clientService.getApprover();
    if (data.status) {
      this.variableapproverList = data.data;
      this.approverList = this.variableapproverList.slice();
    }
  }

  async saveClient() {
    if (this.clientForm.valid) {
      this.uiSpinner.spin$.next(true);
      const requestObject = this.clientForm.value;
      if (this.id) {
        requestObject._id = this.id;
      }
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.SAVE_CLIENT, requestObject);
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'success');
        this.back();
      } else {
        this.uiSpinner.spin$.next(false);
        showNotification(this.snackBar, data.message, 'error');
      }
    }
  }

  confirmExit() {
    if (this.isHideArchiveActionQBD) {
      this.back();
    } else {
      swalWithBootstrapButtons
        .fire({
          title: this.translate.instant('VENDOR.CONFIRMATION_DIALOG.SAVING'),
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.SAVE_EXIT'),
          cancelButtonText: this.translate.instant('COMMON.ACTIONS.DONT_SAVE'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.CANCEL'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.submitting_text = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.SUBMIT');
            // Move to the client listing
            if (this.clientForm.valid) {
              this.saveClient();
            } else {
              // alert form invalidation
              showNotification(this.snackBar, this.submitting_text, 'error');
            }
          } else if (result.isDenied) {
            // ;
          } else {
            this.back();
          }
        });
    }
  }

  async deleteClient() {
    if (this.is_delete == 1) {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.RESTORE');
    } else {
      this.titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ARCHIVE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const requestObject = {
            _id: this.id,
            is_delete: this.is_delete == 1 ? 0 : 1,
          };
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.CLIENT_DELETE, requestObject);
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            this.back();
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  back() {
    this.router.navigate([WEB_ROUTES.CLIENT]);
  }
}
