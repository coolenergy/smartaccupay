import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlertsComponent } from './alerts/alerts.component';
import { AllsettingsComponent } from './allsettings/allsettings.component';
import { CostcodeComponent } from './costcode/costcode.component';
import { DocumentviewComponent } from './documentview/documentview.component';
import { EmployeesettingsComponent } from './employeesettings/employeesettings.component';
import { IntegrationComponent } from './integration/integration.component';
import { MailboxComponent } from './mailbox/mailbox.component';
import { OthersettingsComponent } from './othersettings/othersettings.component';
import { RolesettingsComponent } from './rolesettings/rolesettings.component';
import { SecurityComponent } from './security/security.component';
import { SmtpComponent } from './smtp/smtp.component';
import { UsageComponent } from './usage/usage.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { CompanyInfoFormComponent } from './company-info-form/company-info-form.component';
import { MailboxFormComponent } from './mailbox/mailbox-form/mailbox-form.component';
import { QbointegrationComponent } from './integration/qbointegration/qbointegration.component';
import { QbdintegrationComponent } from './integration/qbdintegration/qbdintegration.component';
import { QuickbooksAuthorizationComponent } from './integration/qbointegration/quickbooks-authorization/quickbooks-authorization.component';

const routes: Routes = [
  {
    path: '',
    component: AllsettingsComponent,
  },
  {
    path: 'mailbox',
    component: MailboxComponent,
  },
  {
    path: 'mailbox-form',
    component: MailboxFormComponent,
  },
  {
    path: 'employeesettings',
    component: EmployeesettingsComponent,
  },
  {
    path: 'rolesettings',
    component: RolesettingsComponent,
  },
  {
    path: 'alerts',
    component: AlertsComponent,
  },
  {
    path: 'smtp',
    component: SmtpComponent,
  },
  {
    path: 'integration',
    component: IntegrationComponent,
  },
  {
    path: 'usage',
    component: UsageComponent,
  },
  {
    path: 'othersettings',
    component: OthersettingsComponent,
  },
  {
    path: 'security',
    component: SecurityComponent,
  },
  {
    path: 'costcode',
    component: CostcodeComponent,
  },
  {
    path: 'documentview',
    component: DocumentviewComponent,
  },
  {
    path: 'company-info-form',
    component: CompanyInfoFormComponent,
  },
  {
    path: 'qbo-integration',
    component: QbointegrationComponent,
  },
  {
    path: 'qbo-integration-online',
    component: QuickbooksAuthorizationComponent,
  },
  {
    path: 'qbd-integration',
    component: QbdintegrationComponent,
  },
  {
    path: 'view-integration',
    component: QuickbooksAuthorizationComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule { }
