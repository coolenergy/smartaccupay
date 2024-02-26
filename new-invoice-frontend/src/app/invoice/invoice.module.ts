import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceListingComponent } from './invoice-listing/invoice-listing.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ViewDocumentComponent } from './view-document/view-document.component';
import { MatSelectFilterModule } from 'mat-select-filter';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { ComponentsModule } from '../shared/components/components.module';
import { SharedModule } from '../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { SendInvoiceMessageComponent } from './invoice-detail/send-invoice-message/send-invoice-message.component';
import { InvoiceMessagesComponent } from './invoice-detail/invoice-messages/invoice-messages.component';
import { InvoiceMessageViewComponent } from './invoice-detail/invoice-message-view/invoice-message-view.component';
import { MailFormComponent } from './mail-form/mail-form.component';
import { UploadInvoiceFormComponent } from './upload-invoice-form/upload-invoice-form.component';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';
import { InvoiceHistoryComponent } from './invoice-history/invoice-history.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { InvoiceRejectedReasonComponent } from './invoice-detail/invoice-rejected-reason/invoice-rejected-reason.component';
import { InvoiceService } from './invoice.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MentionModule } from 'angular-mentions';

@NgModule({
  declarations: [
    InvoiceListingComponent,
    InvoiceDetailComponent,
    ViewDocumentComponent,
    SendInvoiceMessageComponent,
    InvoiceMessagesComponent,
    InvoiceMessageViewComponent,
    MailFormComponent,
    UploadInvoiceFormComponent,
    InvoiceHistoryComponent,
    InvoiceRejectedReasonComponent,
  ],
  providers: [InvoiceService],
  imports: [
    CommonModule,
    TranslateModule,
    InvoiceRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    PdfViewerModule,
    MatExpansionModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatTabsModule,
    MatSelectModule,
    MatSelectFilterModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatMenuModule,
    SharedModule,
    ComponentsModule,
    CommonComponentsModule,
    MatChipsModule,
    MatListModule,
    MatSelectFilterModule,
    TranslateModule,
    MatCheckboxModule,
    MatDialogModule,
    NgScrollbarModule,
    NgxEmojiPickerModule,
    InfiniteScrollModule,
    MatAutocompleteModule,
    MentionModule,
  ],
})
export class InvoiceModule { }
