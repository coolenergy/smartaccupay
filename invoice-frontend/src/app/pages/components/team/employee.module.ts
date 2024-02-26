import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import localeFr from '@angular/common/locales/es';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDialogModule } from '@angular/material/dialog';
import { DataTablesModule } from "angular-datatables";
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { EmployeeFormComponent, ScheduleFormEmployee } from './employee-form/employee-form.component';
import { BulkUploadErrorData, EmployeeListComponent, ExportManagementUserComponent, ImportButtonDownload, TeamHistory, TeamReportForm } from './employee-list/employee-list.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeeViewComponent, EmergencycontactFrom, DocumentUpdateFrom, UserDocumentHistoryComponent } from './employee-view/employee-view.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SharedModule } from 'src/app/shared/shared.module';
import { CommonComponentsModule } from 'src/app/common-components/common-components.module';
// import { MoreParticipantsModelComponent, ScheduleComponent, ScheduleForm } from './schedule/schedule.component';
// import { ShiftComponent, ShiftForm, ShiftHistory } from './shift/shift.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FlatpickrModule } from 'angularx-flatpickr';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { MaterialTimePickerModule } from '@candidosales/material-time-picker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatSelectFilterModule } from 'mat-select-filter';
// import { OnlySelectedPipe } from './schedule/only-selected.pipe';
import { EmpListFilterPipe, EmpListFilterStatusPipe, ImportManagementUserFilterPipe } from './employee-list/emp-list-filter.pipe';
import { NgxPrintModule } from 'ngx-print';
import { CapitalTeamDirective } from './directive/capital.directive';
import { NgxMaskModule, IConfig } from 'ngx-mask';
//import { UserpublicDatatableComponent } from '../userpublic-datatable/userpublic-datatable.component';
import { registerLocaleData } from '@angular/common';
// If using Moment
import { AutosizeModule } from 'ngx-autosize';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ArchiveTeamListComponent } from './archive-team-list/archive-team-list.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
// import { ProjectTimeCardListForm, TimecardHistoryForm, TimecardManuallyForm, TimecardReportForm, TimecardsComponent, TimeCardViewList } from './timecards/timecards.component';
// import { FormateMemberTimeCardPipe, FormateTimeCardPipe, FormateTimePipe, FilterPipe } from './timecards/filter.pipe';

const maskConfig: Partial<IConfig> = {
  validation: false,
};
registerLocaleData(localeFr);
@NgModule({
  declarations: [
    CapitalTeamDirective,
    EmployeeFormComponent,
    EmployeeListComponent,
    ScheduleFormEmployee,
    EmployeeViewComponent,
    EmergencycontactFrom,
    DocumentUpdateFrom,
    UserDocumentHistoryComponent,
    BulkUploadErrorData,
    ImportButtonDownload,
    TeamHistory,
    EmpListFilterPipe,
    EmpListFilterStatusPipe,
    ImportManagementUserFilterPipe,
    TeamReportForm,
    ArchiveTeamListComponent,
    ExportManagementUserComponent,
  ],

  imports: [
    MatTooltipModule,
    AutosizeModule,
    NgbModule,
    MatSelectFilterModule,
    MatAutocompleteModule,
    NgxMatMomentModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MaterialTimePickerModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDialogModule,
    MatSlideToggleModule,
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CommonComponentsModule,
    DataTablesModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgbModalModule,
    InfiniteScrollModule,
    NgxMaskModule.forRoot(maskConfig),
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    NgxPrintModule
  ],
  exports: [
    // TimecardsComponent,
  ],
  bootstrap: [],
  providers: [],
})
export class EmployeePortalModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

