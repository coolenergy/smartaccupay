import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersListingComponent } from './users-listing/users-listing.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { ComponentsModule } from '../shared/components/components.module';
import { SharedModule } from '../shared/shared.module';
import { UserService } from './user.service';
import { UserGridComponent } from './user-grid/user-grid.component';
import { TranslateModule } from '@ngx-translate/core';
import { UserRestoreFormComponent } from './user-restore-form/user-restore-form.component';
import { MatSelectFilterModule } from 'mat-select-filter';
import { UserHistoryComponent } from './user-history/user-history.component';
import { UserReportComponent } from './user-report/user-report.component';
import { UserFormComponent } from './user-form/user-form.component';
import { MatStepperModule } from '@angular/material/stepper';
import { EmpListFilterPipe, EmpListFilterStatusPipe, FormateDateDDMMYYPipe, FormateDateStringPipe } from './users-filter.pipe';
import { UserEmergencyContactComponent } from './user-form/user-emergency-contact/user-emergency-contact.component';
import { UserDocumentComponent } from './user-form/user-document/user-document.component';
import { AddUserEmergenctContactComponent } from './user-form/user-emergency-contact/add-user-emergenct-contact/add-user-emergenct-contact.component';
import { UserDocumentFormComponent } from './user-form/user-document/user-document-form/user-document-form.component';
import { ImportUserComponent } from './import-user/import-user.component';
import { UserExistListComponent } from './user-exist-list/user-exist-list.component';


@NgModule({
  declarations: [
    UsersListingComponent,
    UserGridComponent,
    UserRestoreFormComponent,
    UserHistoryComponent,
    UserReportComponent,
    UserFormComponent,
    EmpListFilterPipe,
    EmpListFilterStatusPipe,
    FormateDateDDMMYYPipe,
    FormateDateStringPipe,
    UserEmergencyContactComponent,
    UserDocumentComponent,
    AddUserEmergenctContactComponent,
    UserDocumentFormComponent,
    ImportUserComponent,
    UserExistListComponent
  ],
  providers: [UserService],
  imports: [
    CommonModule,
    UsersRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatMenuModule,
    SharedModule,
    ComponentsModule,
    InfiniteScrollModule,
    NgScrollbarModule,
    CommonComponentsModule,
    NgxGalleryModule,
    MatChipsModule,
    MatListModule,
    TranslateModule,
    MatSelectFilterModule,
    MatStepperModule,
    MatDatepickerModule,
  ]
})
export class UsersModule { }
