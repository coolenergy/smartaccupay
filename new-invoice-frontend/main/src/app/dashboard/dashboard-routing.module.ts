import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { MonthlyHistoryComponent } from './main/monthly-history/monthly-history.component';
import { MonthlyInvoiceComponent } from './main/monthly-invoice/monthly-invoice.component';
import { DuplidateDocumentsComponent } from './main/duplidate-documents/duplidate-documents.component';
const routes: Routes = [
  /* {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  }, */
  {
    path: '',
    component: MainComponent
  },
  {
    path: WEB_ROUTES.MONTHLY_HISTORY,
    component: MonthlyHistoryComponent
  },
  {
    path: WEB_ROUTES.MONTHLY_INVOICE,
    component: MonthlyInvoiceComponent
  },
  {
    path: WEB_ROUTES.DUPLICATE_DOCUMENTS,
    component: DuplidateDocumentsComponent
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
