import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentsListingComponent } from './documents-listing/documents-listing.component';
import { UnknownDocumentTypeComponent } from './unknown-document-type/unknown-document-type.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentsListingComponent,
  },
  {
    path: 'unknown-document',
    component: UnknownDocumentTypeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule { }
