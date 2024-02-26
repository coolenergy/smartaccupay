import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { DataTablesModule } from "angular-datatables";
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialTimePickerModule } from '@candidosales/material-time-picker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { SettingsCompanyinfoComponent } from './settings-companyinfo/settings-companyinfo.component';
// import { SettingsClockinoutComponent } from './settings-clockinout/settings-clockinout.component';
// import { SettingsEmployeeComponent } from './settings-employee/settings-employee.component';
// import { SettingsRolesComponent } from './settings-roles/settings-roles.component';
// import { SettingsPayrollrulesComponent } from './settings-payrollrules/settings-payrollrules.component';
// import { SettingsAlertsComponent } from './settings-alerts/settings-alerts.component';
// import { SettingsLocationsComponent } from './settings-locations/settings-locations.component';
import { SettingsSmtpComponent } from './settings-smtp/settings-smtp.component';
// import { WebsitepluginComponent } from './websiteplugin/websiteplugin.component';
// import { SettingsIntegrationsComponent } from './settings-integrations/settings-integrations.component';
// import { SettingsUsageComponent } from './settings-usage/settings-usage.component';
// import { EmployeeDocumentTypeComponent } from './settings-employee/employee-document-type/employee-document-type.component';
// import { EmployeeDepartmentsComponent } from './settings-employee/employee-departments/employee-departments.component';
// import { EmployeeJobtypeComponent } from './settings-employee/employee-jobtype/employee-jobtype.component';
// import { EmployeeRelationshipComponent } from './settings-employee/employee-relationship/employee-relationship.component';
// import { EmployeePayrollgroupComponent } from './settings-employee/employee-payrollgroup/employee-payrollgroup.component';
// import { EmployeeJobtitleComponent } from './settings-employee/employee-jobtitle/employee-jobtitle.component';
// import { WeeklyPayrollruleComponent } from './settings-payrollrules/weekly-payrollrule/weekly-payrollrule.component';
// import { BiweeklyPayrollruleComponent } from './settings-payrollrules/biweekly-payrollrule/biweekly-payrollrule.component';
// import { MonthlyPayrollruleComponent } from './settings-payrollrules/monthly-payrollrule/monthly-payrollrule.component';
// import { SemimonthlyPayrollruleComponent } from './settings-payrollrules/semimonthly-payrollrule/semimonthly-payrollrule.component';
// import { SettingsCostcodeComponent } from './settings-costcode/settings-costcode.component';

import { NgxMaskModule, IConfig } from 'ngx-mask';
import { SettingRoleComponent } from './setting-role/setting-role.component';
import { ImportDataErrorEmpSetting, ImportEmpSettingDownload, SettingsEmployeeComponent } from './settings-employee/settings-employee.component';
import { EmployeeDepartmentsComponent } from './settings-employee/employee-departments/employee-departments.component';
import { EmployeeDocumentTypeComponent } from './settings-employee/employee-document-type/employee-document-type.component';
import { EmployeeJobtitleComponent } from './settings-employee/employee-jobtitle/employee-jobtitle.component';
import { EmployeeJobtypeComponent } from './settings-employee/employee-jobtype/employee-jobtype.component';
import { EmployeePayrollgroupComponent } from './settings-employee/employee-payrollgroup/employee-payrollgroup.component';
import { EmployeeRelationshipComponent } from './settings-employee/employee-relationship/employee-relationship.component';
import { MailboxMonitorComponent } from './mailbox-monitor/mailbox-monitor.component';
import { AlertsComponent } from './alerts/alerts.component';
import { IntegrationsComponent } from './integrations/integrations.component';
import { UsageComponent } from './usage/usage.component';
import { CostCodeComponent, CostCodeFormComponent, CostcodeImportData } from './cost-code/cost-code.component';
import { TermsComponent } from './invoice-other-settings/terms/terms.component';
import { TaxRateComponent } from './invoice-other-settings/tax-rate/tax-rate.component';
import { DocumentsComponent } from './invoice-other-settings/documents/documents.component';
import { SettingsSecurityComponent } from './settings-security/settings-security.component';
import { DocumentViewComponent } from './document-view/document-view.component';
import { MailboxFormComponent } from './mailbox-monitor/mailbox-form/mailbox-form.component';

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [
    SettingsCompanyinfoComponent,
    // SettingsClockinoutComponent,
    // SettingsEmployeeComponent,
    // SettingsRolesComponent,
    // SettingsPayrollrulesComponent,
    // SettingsAlertsComponent,
    // SettingsLocationsComponent,
    SettingsSmtpComponent,
    //WebsitepluginComponent,
    // SettingsIntegrationsComponent,
    // SettingsUsageComponent,
    // EmployeeDocumentTypeComponent,
    // EmployeeDepartmentsComponent,
    // EmployeeJobtypeComponent,
    // EmployeeRelationshipComponent,
    // EmployeePayrollgroupComponent,
    // EmployeeJobtitleComponent,
    // WeeklyPayrollruleComponent,
    // BiweeklyPayrollruleComponent,
    // MonthlyPayrollruleComponent,
    // SemimonthlyPayrollruleComponent,
    // SettingsCostcodeComponent,

    SettingRoleComponent,
    SettingsEmployeeComponent,
    EmployeeDepartmentsComponent,
    EmployeeDocumentTypeComponent,
    EmployeeJobtitleComponent,
    EmployeeJobtypeComponent,
    EmployeePayrollgroupComponent,
    EmployeeRelationshipComponent,
    ImportEmpSettingDownload,
    ImportDataErrorEmpSetting,
    MailboxMonitorComponent,
    AlertsComponent,
    IntegrationsComponent,
    UsageComponent,
    CostCodeComponent,
    CostCodeFormComponent,
    CostcodeImportData,
    TermsComponent,
    TaxRateComponent,
    DocumentsComponent,
    SettingsSecurityComponent, , DocumentViewComponent, MailboxFormComponent

    ,
  ],

  imports: [
    NgxMatMomentModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MaterialTimePickerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDialogModule,
    MatSlideToggleModule,
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonComponentsModule,
    DataTablesModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbModalModule,
    NgxMaskModule.forRoot(maskConfig),
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],

  exports: [
  ],

  providers: [

  ],

})
export class SettingsProtalModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

