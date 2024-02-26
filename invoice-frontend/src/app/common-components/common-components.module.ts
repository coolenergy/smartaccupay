import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SelectUserRoleForm, TeamArchiveCradComponent, UserCardComponent, } from './user-card/user-card.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataTablesModule } from "angular-datatables";
import { NgxGalleryModule } from 'ngx-gallery-9';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectFilterModule } from 'mat-select-filter';
import { InvoiceCardComponent } from './invoice-card/invoice-card.component';

@NgModule({
  declarations: [

    UserCardComponent,
    TeamArchiveCradComponent,
    SelectUserRoleForm,
    InvoiceCardComponent,

  ],
  imports: [
    NgxGalleryModule,
    MatCardModule,
    DataTablesModule,
    MatListModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatDialogModule,
    MatInputModule,
    RouterModule,
    MatTooltipModule,
    MatButtonModule,
    MatToolbarModule,
    CommonModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    MatSidenavModule,
    MatSelectFilterModule,
    ReactiveFormsModule,
    HttpClientModule, TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  exports: [

    UserCardComponent,
    TeamArchiveCradComponent,
    SelectUserRoleForm,
    InvoiceCardComponent


  ],
})
export class CommonComponentsModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

