import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { AllsettingsComponent } from './allsettings/allsettings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ComponentsModule } from '../shared/components/components.module';
import { MailboxComponent } from './mailbox/mailbox.component';
import { EmployeesettingsComponent } from './employeesettings/employeesettings.component';
import { RolesettingsComponent } from './rolesettings/rolesettings.component';
import { AlertsComponent } from './alerts/alerts.component';
import { SmtpComponent } from './smtp/smtp.component';
import { IntegrationComponent } from './integration/integration.component';
import { UsageComponent } from './usage/usage.component';
import { OthersettingsComponent } from './othersettings/othersettings.component';
import { SecurityComponent } from './security/security.component';
import { CostcodeComponent } from './costcode/costcode.component';
import { DocumentviewComponent } from './documentview/documentview.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CompanyInfoFormComponent } from './company-info-form/company-info-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectFilterModule } from 'mat-select-filter';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { SharedModule } from '../shared/shared.module';
import { SettingsService } from './settings.service';
import { MailboxFormComponent } from './mailbox/mailbox-form/mailbox-form.component';
import { RelationshipFormComponent } from './employeesettings/relationship-list/relationship-form/relationship-form.component';
import { LanguageFormComponent } from './employeesettings/language-list/language-form/language-form.component';
import { TermsFormComponent } from './othersettings/terms-listing/terms-form/terms-form.component';
import { TaxRateFormComponent } from './othersettings/tax-rate-listing/tax-rate-form/tax-rate-form.component';
import { DocumentFormComponent } from './othersettings/documents-listing/document-form/document-form.component';
import { VendorTypeFormComponent } from './othersettings/vendor-type-listing/vendor-type-form/vendor-type-form.component';
import { CostCodeFormComponent } from './costcode/cost-code-form/cost-code-form.component';
import { JobNameFormComponent } from './othersettings/job-name-listing/job-name-form/job-name-form.component';
import { ImportOtherSettingsComponent } from './othersettings/import-other-settings/import-other-settings.component';
import { DocumentTypeListComponent } from './employeesettings/document-type-list/document-type-list.component';
import { QbointegrationComponent } from './integration/qbointegration/qbointegration.component';
import { QbdintegrationComponent } from './integration/qbdintegration/qbdintegration.component';
import { DepartmentListComponent } from './employeesettings/department-list/department-list.component';
import { JobTitleListComponent } from './employeesettings/job-title-list/job-title-list.component';
import { JobTypeListComponent } from './employeesettings/job-type-list/job-type-list.component';
import { RelationshipListComponent } from './employeesettings/relationship-list/relationship-list.component';
import { LanguageListComponent } from './employeesettings/language-list/language-list.component';
import { TermsListingComponent } from './othersettings/terms-listing/terms-listing.component';
import { TaxRateListingComponent } from './othersettings/tax-rate-listing/tax-rate-listing.component';
import { DocumentsListingComponent } from './othersettings/documents-listing/documents-listing.component';
import { VendorTypeListingComponent } from './othersettings/vendor-type-listing/vendor-type-listing.component';
import { JobNameListingComponent } from './othersettings/job-name-listing/job-name-listing.component';
import { TranslateModule } from '@ngx-translate/core';
import { ImportEmployeeSettingsComponent } from './employeesettings/import-employee-settings/import-employee-settings.component';
import { QuickbooksAuthorizationComponent } from './integration/qbointegration/quickbooks-authorization/quickbooks-authorization.component';
import { ImportCostcodeSettingsComponent } from './costcode/import-costcode-settings/import-costcode-settings.component';
import { ClassNameListingComponent } from './othersettings/class-name-listing/class-name-listing.component';
import { ClassNameFormComponent } from './othersettings/class-name-listing/class-name-form/class-name-form.component';
import { ExistListingComponent } from './employeesettings/exist-listing/exist-listing.component';
import { OtherExistListingComponent } from './othersettings/other-exist-listing/other-exist-listing.component';
import { DepartmentFormComponent } from './employeesettings/department-list/department-form/department-form.component';
import { DocumentTypeFormComponent } from './employeesettings/document-type-list/document-type-form/document-type-form.component';
import { JobTitleFormComponent } from './employeesettings/job-title-list/job-title-form/job-title-form.component';
import { JobTypeFormComponent } from './employeesettings/job-type-list/job-type-form/job-type-form.component';
import { VendorsService } from '../vendors/vendors.service';
import { OtherExistsListingComponent } from './othersettings/other-exists-listing/other-exists-listing.component';
import { CostcodeExistListComponent } from './costcode/costcode-exist-list/costcode-exist-list.component';

@NgModule({
  declarations: [
    AllsettingsComponent,
    MailboxComponent,
    EmployeesettingsComponent,
    RolesettingsComponent,
    AlertsComponent,
    SmtpComponent,
    IntegrationComponent,
    UsageComponent,
    OthersettingsComponent,
    SecurityComponent,
    CostcodeComponent,
    DocumentviewComponent,
    CompanyInfoFormComponent,
    MailboxFormComponent,
    DocumentTypeFormComponent,
    DepartmentFormComponent,
    JobTitleFormComponent,
    JobTypeFormComponent,
    RelationshipFormComponent,
    LanguageFormComponent,
    TermsFormComponent,
    TaxRateFormComponent,
    DocumentFormComponent,
    VendorTypeFormComponent,
    CostCodeFormComponent,
    JobNameFormComponent,
    ImportOtherSettingsComponent,
    DocumentTypeListComponent,
    QbointegrationComponent,
    QbdintegrationComponent,
    DepartmentListComponent,
    JobTitleListComponent,
    JobTypeListComponent,
    RelationshipListComponent,
    LanguageListComponent,
    TermsListingComponent,
    TaxRateListingComponent,
    DocumentsListingComponent,
    VendorTypeListingComponent,
    JobNameListingComponent,
    ImportEmployeeSettingsComponent,
    QuickbooksAuthorizationComponent,
    ImportCostcodeSettingsComponent,
    ClassNameListingComponent,
    ClassNameFormComponent,
    ExistListingComponent,
    OtherExistListingComponent,
    OtherExistsListingComponent,
    CostcodeExistListComponent,
  ],
  providers: [SettingsService, VendorsService],
  imports: [
    CommonModule,
    SettingsRoutingModule,

    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    ComponentsModule,
    MatSlideToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatMenuModule,
    SharedModule,
    ComponentsModule,
    InfiniteScrollModule,
    NgScrollbarModule,
    CommonComponentsModule,
    NgxGalleryModule,
    MatChipsModule,
    MatListModule,
    MatSelectFilterModule,
    TranslateModule,
  ],
})
export class SettingsModule { }
