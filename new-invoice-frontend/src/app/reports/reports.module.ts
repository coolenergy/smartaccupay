import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsListingComponent } from './reports-listing/reports-listing.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { ReportService } from './report.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReportsComponent } from './reports/reports.component';
import { MatButtonModule } from '@angular/material/button';
import { SelectReportValueComponent } from './select-report-value/select-report-value.component';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectFilterModule } from 'mat-select-filter';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { SharedModule } from '../shared/shared.module';
import { CommonComponentsModule } from '../common-components/common-components.module';


@NgModule({
  declarations: [
    ReportsListingComponent,
    ReportsComponent,
    SelectReportValueComponent
  ],
  providers: [ReportService],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MatTableModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    TranslateModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatSelectFilterModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    SharedModule,
    CommonComponentsModule,
  ]
})
export class ReportsModule { }
