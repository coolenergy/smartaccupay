import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { PhoneFormatPipe } from './common.pipe';
import { LoadingComponent } from './loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustompdfviewerComponent } from './custompdfviewer/custompdfviewer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ModelHeaderComponent } from './model-header/model-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
    CustompdfviewerComponent,
    ModelHeaderComponent,
  ],
  exports: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
    CustompdfviewerComponent,
    ModelHeaderComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    PdfViewerModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class CommonComponentsModule { }
