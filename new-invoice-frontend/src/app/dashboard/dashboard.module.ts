import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { MainComponent } from './main/main.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxGaugeModule } from 'ngx-gauge';
import { MonthlyHistoryComponent } from './main/monthly-history/monthly-history.component';
import { TranslateModule } from '@ngx-translate/core';
import { MonthlyInvoiceComponent } from './main/monthly-invoice/monthly-invoice.component';
import { DuplidateDocumentsComponent } from './main/duplidate-documents/duplidate-documents.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '../shared/shared.module';
import { MatSortModule } from '@angular/material/sort';
@NgModule({
  declarations: [MainComponent, MonthlyHistoryComponent, MonthlyInvoiceComponent, DuplidateDocumentsComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgScrollbarModule,
    MatIconModule,
    NgApexchartsModule,
    MatButtonModule,
    MatTooltipModule,
    MatTabsModule,
    NgxGaugeModule,
    TranslateModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatTableModule,
    SharedModule,
  ],
})
export class DashboardModule { }
