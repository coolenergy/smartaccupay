import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PagesCoreComponent } from './pages-core/pages-core.component';
import { PortalAuthGuard } from './components/portal-auth/guards';
import { HelppageComponent } from './helppage/helppage.component';
import { ChangepasswordComponent } from './helppage/changepassword/changepassword.component';
import { TermspageComponent } from './helppage/termspage/termspage.component';
import { SettingComponent } from './components/setting/setting.component';
import { CustompdfviewerComponent } from '../common-components/custompdfviewer/custompdfviewer.component';
import { CustomimageviewerComponent } from '../common-components/customimageviewer/customimageviewer.component';
import { UserpublicDatatableComponent } from './components/userpublic-datatable/userpublic-datatable.component';
import { EmployeeListComponent } from './components/team/employee-list/employee-list.component';
import { EmployeeFormComponent } from './components/team/employee-form/employee-form.component';
import { EmployeeViewComponent } from './components/team/employee-view/employee-view.component';
import { SettingRoleComponent } from './components/setting/setting-role/setting-role.component';
import { SettingsEmployeeComponent } from './components/setting/settings-employee/settings-employee.component';
import { EmployeeDepartmentsComponent } from './components/setting/settings-employee/employee-departments/employee-departments.component';
import { EmployeeDocumentTypeComponent } from './components/setting/settings-employee/employee-document-type/employee-document-type.component';
import { EmployeeJobtitleComponent } from './components/setting/settings-employee/employee-jobtitle/employee-jobtitle.component';
import { EmployeeJobtypeComponent } from './components/setting/settings-employee/employee-jobtype/employee-jobtype.component';
import { EmployeePayrollgroupComponent } from './components/setting/settings-employee/employee-payrollgroup/employee-payrollgroup.component';
import { EmployeeRelationshipComponent } from './components/setting/settings-employee/employee-relationship/employee-relationship.component';

import { InvoiceComponent } from './components/invoice/invoice.component';
import { ReportsComponent } from './components/reports/reports.component';
import { MailboxMonitorComponent } from './components/setting/mailbox-monitor/mailbox-monitor.component';
import { AlertsComponent } from './components/setting/alerts/alerts.component';
import { IntegrationsComponent } from './components/setting/integrations/integrations.component';
import { UsageComponent } from './components/setting/usage/usage.component';
import { CostCodeComponent } from './components/setting/cost-code/cost-code.component';
import { TermsComponent } from './components/setting/invoice-other-settings/terms/terms.component';
import { TaxRateComponent } from './components/setting/invoice-other-settings/tax-rate/tax-rate.component';
import { DocumentsComponent } from './components/setting/invoice-other-settings/documents/documents.component';
import { ArchiveTeamListComponent } from './components/team/archive-team-list/archive-team-list.component';
import { InvoiceFormComponent } from './components/invoice/invoice-form/invoice-form.component';
import { InvoiceDetailPageComponent } from './components/invoice/invoice-detail-page/invoice-detail-page.component';
import { InvoiceOtherSettingsComponent } from './components/setting/invoice-other-settings/invoice-other-settings.component';
import { InvoiceDashboardComponent } from './components/dashboard/invoice-dashboard.component';
import { VendorsComponent } from './components/vendors/vendors.component';
import { VendorFormComponent } from './components/vendors/vendor-form/vendor-form.component';
import { ArchiveVendorComponent } from './components/vendors/archive-vendor/archive-vendor.component';
import { FormCoreComponent } from './form-core/form-core.component';
import { DashboardInvoiceListComponent } from './components/dashboard/dashboard-invoice-list/dashboard-invoice-list.component';
import { DashboardFilesListComponent } from './components/dashboard/dashboard-files-list/dashboard-files-list.component';
import { PackingSlipFormComponent } from './components/invoice/packing-slip-form/packing-slip-form.component';
import { PoDetailFormComponent } from './components/invoice/po-detail-form/po-detail-form.component';
import { ReceivingSlipFormComponent } from './components/invoice/receiving-slip-form/receiving-slip-form.component';
import { QuoteFormComponent } from './components/invoice/quote-form/quote-form.component';
import { DocumentsListComponent } from './components/invoice/documents-list/documents-list.component';
import { MailboxFormComponent } from './components/setting/mailbox-monitor/mailbox-form/mailbox-form.component';


const routes: Routes = [

  {
    path: "",
    component: FormCoreComponent,
    children: [
      {
        path: 'invoice-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: InvoiceFormComponent
      },
      {
        path: 'packing-slip-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: PackingSlipFormComponent
      }, {
        path: 'po-detail-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: PoDetailFormComponent
      },
      {
        path: 'receiving-slip-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: ReceivingSlipFormComponent
      }, {
        path: 'quote-detail-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: QuoteFormComponent
      },
      {
        path: 'vendor-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: VendorFormComponent
      },
      {
        path: 'employee-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeFormComponent
      },
      {
        path: 'employee-view/:idparms',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeViewComponent
      },
      {
        path: 'mail-box-form',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: MailboxFormComponent
      },
    ],
  },
  {
    path: '',
    component: PagesCoreComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./../pages/components/portal-auth/portal-auth.module').then(m => m.PortalAuthModule)
        // path: '',
        // pathMatch: 'full',
        // redirectTo: 'login'
      },
      {
        path: 'dashboard',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: InvoiceDashboardComponent
      },
      {
        path: 'dashboard-invoice-list',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: DashboardInvoiceListComponent
      },
      {
        path: 'dashboard-files-list',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: DashboardFilesListComponent
      },
      {
        path: 'invoice',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: InvoiceComponent
      },
      {
        path: 'vendors',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: VendorsComponent
      },
      {
        path: 'vendor-archive',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: ArchiveVendorComponent
      },
      {
        path: 'reports',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: ReportsComponent
      },
      {
        path: 'mailbox',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: MailboxMonitorComponent
      },
      {
        path: 'alerts',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: AlertsComponent
      },
      {
        path: 'integration',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: IntegrationsComponent
      },
      {
        path: 'usage',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: UsageComponent
      },
      {
        path: 'cost-code',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: CostCodeComponent
      },
      {
        path: 'terms',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: TermsComponent
      },
      {
        path: 'taxrate',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: TaxRateComponent
      },
      {
        path: 'documents',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: DocumentsComponent
      },

      {
        path: 'employee-list',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeListComponent
      },

      {
        path: 'userpublicdata',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: UserpublicDatatableComponent,
      },

      {
        path: 'app-custompdfviewer',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: CustompdfviewerComponent,
      },
      {
        path: 'app-customimageviewer',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: CustomimageviewerComponent,
      },

      {
        path: 'setting',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: SettingComponent,
      },

      {
        path: 'settings',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: InvoiceOtherSettingsComponent,
      },
      {
        path: 'settings-employee',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: SettingsEmployeeComponent,
      },
      {
        path: 'archive-team-list',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: ArchiveTeamListComponent
      },
      {
        path: 'employee-departments',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeDepartmentsComponent,
      },
      {
        path: 'employee-document-type',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeDocumentTypeComponent,
      },
      {
        path: 'employee-jobtitle',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeJobtitleComponent,
      },
      {
        path: 'employee-jobtype',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeJobtypeComponent,
      },
      {
        path: 'employee-payrollgroup',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeePayrollgroupComponent,
      },
      {
        path: 'employee-relationship',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: EmployeeRelationshipComponent,
      },
      {
        path: 'settings-role',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: SettingRoleComponent,
      },







      //---------------------------------------

      {
        path: 'helppage',
        pathMatch: 'full',
        component: HelppageComponent
      },
      {
        path: 'changepassword',
        pathMatch: 'full',
        component: ChangepasswordComponent
      },
      {
        path: 'termspage',
        pathMatch: 'full',
        component: TermspageComponent
      },
      /* {
        path: 'forcefully-resetpassword',
        pathMatch: 'full',
        component: ForcefullyResetpasswordComponent
      }, */

      {
        path: 'invoice-detail',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: InvoiceDetailPageComponent
      },
      {
        path: 'documents-list',
        pathMatch: 'full',
        canActivate: [PortalAuthGuard],
        component: DocumentsListComponent,
      },
    ]
  },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
