import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PagesCoreComponent } from './pages-core/pages-core.component';
import { LeftPanelComponent } from './common/left-panel/left-panel.component';
import { AddressBook, HeaderComponent } from './common/header/header.component';
import { ContentSectionComponent } from './content-section/content-section.component';
import { LanguageComponent, UserComponent } from "./common/header/components";
import { DemoMaterialModule } from './material-module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { DataTablesModule } from "angular-datatables";
import { CommonComponentsModule } from "../common-components/common-components.module";
import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SettingComponent } from './components/setting/setting.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { EmployeePortalModule } from './components/team/employee.module';
import { MaterialTimePickerModule } from '@candidosales/material-time-picker';
import { SettingsCompanyinfoComponent } from './components/setting/settings-companyinfo/settings-companyinfo.component';
import { SettingsSmtpComponent } from './components/setting/settings-smtp/settings-smtp.component';

import { ImOtherDownload, ImportOther, InvoiceOtherSettingsComponent } from './components/setting/invoice-other-settings/invoice-other-settings.component';
import { NgxMatColorPickerModule } from '@angular-material-components/color-picker';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatSelectFilterModule } from 'mat-select-filter';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { UserpublicDatatableComponent } from './components/userpublic-datatable/userpublic-datatable.component';
const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: false,
    dropSpecialCharacters: true
  };
};

import { NgxPrintModule } from 'ngx-print';
import { ChartsModule } from 'ng2-charts';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CustompdfviewerComponent, RejectVendorCertificateForm } from '../common-components/custompdfviewer/custompdfviewer.component';
import { CustomimageviewerComponent } from '../common-components/customimageviewer/customimageviewer.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { PortalModule } from '@angular/cdk/portal';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { ShortcutsMenuComponent, ShortcutsAddComponent } from './common/header/components/shortcuts-menu/shortcuts-menu.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyPipe } from '@angular/common';
import { configdata } from 'src/environments/configData';

import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { IframeCustomepdfviewerComponent } from '../common-components/iframe-customepdfviewer/iframe-customepdfviewer.component';
import { SettingRoleComponent } from './components/setting/setting-role/setting-role.component';
import { ImportDataErrorEmpSetting, ImportEmpSettingDownload, SettingsEmployeeComponent } from './components/setting/settings-employee/settings-employee.component';
import { EmployeedepartmentForm, EmployeeDepartmentsComponent } from './components/setting/settings-employee/employee-departments/employee-departments.component';
import { EmployeeDocumentTypeComponent, EmployeeDocumentTypeForm } from './components/setting/settings-employee/employee-document-type/employee-document-type.component';
import { EmployeeJobtitleComponent, EmployeeJobTitleForm } from './components/setting/settings-employee/employee-jobtitle/employee-jobtitle.component';
import { EmployeeJobtypeComponent, EmployeeJobTypeForm } from './components/setting/settings-employee/employee-jobtype/employee-jobtype.component';
import { EmployeePayrollgroupComponent, EmployeePayRollGroupForm } from './components/setting/settings-employee/employee-payrollgroup/employee-payrollgroup.component';
import { EmployeeRelationshipComponent, EmployeeRelationshipForm } from './components/setting/settings-employee/employee-relationship/employee-relationship.component';
import { CdkAccordionModule } from '@angular/cdk/accordion';

import { InvoiceAttachment, InvoiceComponent, InvoiceReport } from './components/invoice/invoice.component';
import { ReportsComponent } from './components/reports/reports.component';
import { MailboxMonitorComponent } from './components/setting/mailbox-monitor/mailbox-monitor.component';
import { AlertsComponent } from './components/setting/alerts/alerts.component';
import { IntegrationsComponent } from './components/setting/integrations/integrations.component';
import { UsageComponent } from './components/setting/usage/usage.component';
import { CostCodeComponent, CostCodeFormComponent, CostcodeImportData } from './components/setting/cost-code/cost-code.component';
import { TermsComponent, TermsForm } from './components/setting/invoice-other-settings/terms/terms.component';
import { TaxRateComponent, TaxRateForm } from './components/setting/invoice-other-settings/tax-rate/tax-rate.component';
import { DocumentForm, DocumentsComponent } from './components/setting/invoice-other-settings/documents/documents.component';
import { SettingsSecurityComponent } from './components/setting/settings-security/settings-security.component';
import { InvoiceFormComponent, InvoiceHistoryComponent, InvoiceRejectReason } from './components/invoice/invoice-form/invoice-form.component';
import { InvoiceDetailPageComponent } from './components/invoice/invoice-detail-page/invoice-detail-page.component';
import { InvoiceDashboardComponent } from './components/dashboard/invoice-dashboard.component';
import { VendorHistoryComponent, VendorReportComponent, VendorsComponent } from './components/vendors/vendors.component';
import { VendorFormComponent } from './components/vendors/vendor-form/vendor-form.component';
import { ArchiveVendorComponent } from './components/vendors/archive-vendor/archive-vendor.component';
import { EmployeeLanguageComponent, EmployeeLanguageForm } from './components/setting/settings-employee/employee-language/employee-language.component';
import { PackingSlipFormComponent } from './components/invoice/packing-slip-form/packing-slip-form.component';
import { ReceivingSlipFormComponent } from './components/invoice/receiving-slip-form/receiving-slip-form.component';
import { QuoteFormComponent } from './components/invoice/quote-form/quote-form.component';
import { PoDetailFormComponent } from './components/invoice/po-detail-form/po-detail-form.component';
import { FormCoreComponent } from './form-core/form-core.component';
import { DashboardInvoiceListComponent } from './components/dashboard/dashboard-invoice-list/dashboard-invoice-list.component';
import { DashboardFilesListComponent } from './components/dashboard/dashboard-files-list/dashboard-files-list.component';
import { AddOtherFiles, InvoiceOtherDocumentComponent, OrphanFiles, RequestFilesComponent } from './components/invoice/invoice-other-document/invoice-other-document.component';
import { DocumentViewComponent } from './components/setting/document-view/document-view.component';
import { CheckDateRangePipe, InvoiceListFilterPipe, InvoiceListFilterStatus } from './components/invoice/invoice-list-filter.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DocumentsListComponent, DocumentSelectDialog } from './components/invoice/documents-list/documents-list.component';
import { MailboxFormComponent } from './components/setting/mailbox-monitor/mailbox-form/mailbox-form.component';
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { InvoiceProgressComponent } from './common/header/components/invoice-progress/invoice-progress.component';
import { InvoicProgressFilterPipe } from './common/header/components/invoice-progress/invoic-progress-filter.pipe';
import { NotificationsComponent } from './common/header/components/notifications/notifications.component';
import { CommonDocumentComponent } from './components/invoice/common-document/common-document.component';




@NgModule({
  declarations: [
    PagesCoreComponent,
    LeftPanelComponent,
    HeaderComponent,
    ContentSectionComponent,
    LanguageComponent,
    UserComponent,
    SettingComponent,
    SettingsCompanyinfoComponent,
    SettingsSmtpComponent,

    UserpublicDatatableComponent,

    CustompdfviewerComponent,
    CustomimageviewerComponent,
    ShortcutsMenuComponent,
    ShortcutsAddComponent,
    InvoiceOtherSettingsComponent,
    IframeCustomepdfviewerComponent,
    SettingRoleComponent,
    RejectVendorCertificateForm,
    ImportEmpSettingDownload,
    ImportDataErrorEmpSetting,
    SettingsEmployeeComponent,
    EmployeedepartmentForm,
    EmployeeDepartmentsComponent,
    EmployeeDocumentTypeComponent,
    EmployeeJobtitleComponent,
    EmployeeJobtypeComponent,
    EmployeePayrollgroupComponent,
    EmployeeRelationshipComponent,
    EmployeeDocumentTypeForm,
    EmployeeJobTitleForm,
    EmployeeJobTypeForm,
    EmployeePayRollGroupForm,
    EmployeeRelationshipForm,
    AddressBook,
    InvoiceDashboardComponent,
    InvoiceComponent,
    ReportsComponent,
    MailboxMonitorComponent,
    AlertsComponent,
    IntegrationsComponent,
    UsageComponent,
    CostCodeComponent,
    TermsComponent,
    TaxRateComponent,
    DocumentsComponent,
    TermsForm,
    TaxRateForm,
    FormCoreComponent,
    DocumentForm,
    ImOtherDownload,
    ImportOther,
    SettingsSecurityComponent,
    InvoiceFormComponent,
    InvoiceAttachment,
    InvoiceReport,
    InvoiceDetailPageComponent,
    CostCodeFormComponent,
    CostcodeImportData,
    VendorsComponent,
    VendorFormComponent,
    ArchiveVendorComponent,
    VendorHistoryComponent,
    VendorReportComponent,
    EmployeeLanguageComponent,
    EmployeeLanguageForm,
    PackingSlipFormComponent,
    ReceivingSlipFormComponent,
    QuoteFormComponent,
    PoDetailFormComponent,
    DashboardInvoiceListComponent,
    DashboardFilesListComponent,
    InvoiceOtherDocumentComponent,
    DocumentViewComponent,
    AddOtherFiles,
    OrphanFiles,
    InvoiceListFilterPipe,
    InvoiceListFilterStatus,
    CheckDateRangePipe,
    InvoiceHistoryComponent,
    InvoiceRejectReason,
    DocumentsListComponent,
    RequestFilesComponent,
    DocumentSelectDialog,
    MailboxFormComponent,
    InvoiceProgressComponent,
    InvoicProgressFilterPipe,
    NotificationsComponent,
    CommonDocumentComponent
  ],
  imports: [
    PortalModule,
    NgxGalleryModule,
    InfiniteScrollModule,
    PdfViewerModule,
    NgxSliderModule,
    MaterialTimePickerModule,
    NgbPaginationModule, NgbAlertModule,
    CommonComponentsModule,
    EmployeePortalModule,
    NgxMapboxGLModule.withConfig({ accessToken: configdata.MAPBOXAPIKEY }),
    NgxMatColorPickerModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    ColorPickerModule,
    MatSelectFilterModule,
    DemoMaterialModule,
    NgbModule,
    HttpClientModule,
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    DataTablesModule,
    MatSortModule,
    MatTableModule,

    MatAutocompleteModule,
    CdkAccordionModule,
    // MatGridListModule,
    NgxMaskModule.forRoot(maskConfigFunction),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SignaturePadModule,
    NgxPrintModule,
    ChartsModule,
    LazyLoadImageModule,
    MatChipsModule,

  ],
  providers: [CurrencyPipe],
  exports: [MatTooltipModule, HeaderComponent],
  bootstrap: [HeaderComponent,]
})
export class PagesModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
