import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PortalAuthModule } from './pages/components/portal-auth/portal-auth.module';
import { DemoMaterialModule } from '../app/pages/material-module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HelpPageModule } from './pages/helppage/helppage.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { CapitalDirective } from './service/capital.directive';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AutosizeModule } from 'ngx-autosize';
import { LandingPageComponent } from './pages/components/landing-page/landing-page.component';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive'; // this includes the core NgIdleModule but includes keepalive providers for easy wireup
import { MomentModule } from 'angular2-moment'; // optional, provides moment-style pipes for date formatting

import { CurrencyPipe } from '@angular/common';
//import { DataTablesModule } from "angular-datatables";
const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: false,
  };
};
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChartsModule } from 'ng2-charts';
import { configdata } from 'src/environments/configData';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatGridListModule } from '@angular/material/grid-list';
import { SettingsSecurityComponent } from './pages/components/setting/settings-security/settings-security.component';

@NgModule({
  declarations: [
    AppComponent,
    CapitalDirective,
    LandingPageComponent,
    //UserpublicpageComponent,
  ],
  imports: [
    //DataTablesModule,
    PortalAuthModule,
    InfiniteScrollModule,
    NgxSliderModule,
    MatProgressSpinnerModule,
    OverlayModule,
    BrowserModule,

    DemoMaterialModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule.forRoot(),
    AutosizeModule,
    BrowserAnimationsModule,
    NgxMaskModule.forRoot(maskConfigFunction),
    NgxMapboxGLModule.withConfig({
      accessToken: configdata.MAPBOXAPIKEY,
    }),
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
    NgIdleKeepaliveModule.forRoot(),
    MomentModule,
    NgOtpInputModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    ChartsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
  ],
  providers: [AppComponent, CurrencyPipe, { provide: LocationStrategy, useClass: PathLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
