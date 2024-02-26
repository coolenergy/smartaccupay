import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { InvoiceListingComponent } from './invoice-listing/invoice-listing.component';
import { ViewDocumentComponent } from './view-document/view-document.component';
import { InvoiceMessagesComponent } from './invoice-detail/invoice-messages/invoice-messages.component';
import { InvoiceMessageViewComponent } from './invoice-detail/invoice-message-view/invoice-message-view.component';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceListingComponent,
  },
  {
    path: WEB_ROUTES.DETAILS,
    component: InvoiceDetailComponent,
  },
  {
    path: WEB_ROUTES.VIEW_DOCUMENT,
    component: ViewDocumentComponent,
  },
  {
    path: WEB_ROUTES.MESSAGES,
    component: InvoiceMessagesComponent,
  },
  {
    path: WEB_ROUTES.MESSAGE_VIEW,
    component: InvoiceMessageViewComponent,
  },
  {
    path: WEB_ROUTES.HISTORY,
    component: InvoiceHistoryComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
