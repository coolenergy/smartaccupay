import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { AuthPageComponent } from './containers';
import { AuthRoutingModule } from './portal-auth-routing.module';
import { MatIconModule } from '@angular/material/icon';
import { YearPipe } from './pipes';
import { PortalAuthService, EmailService } from './services';
import { PortalLoginFormComponent } from './components';
import { PortalAuthGuard } from './guards';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ForcefullChangePasswordComponent } from './components/forcefull-change-password/forcefull-change-password.component';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe } from '@angular/common';
import { NgOtpInputModule } from 'ng-otp-input';
const maskConfigFunction: () => Partial<IConfig> = () => {
  return {
    validation: false,
  };
};

@NgModule({
  declarations: [
    AuthPageComponent,
    YearPipe,
    PortalLoginFormComponent,
    ForcefullChangePasswordComponent,
  ],
  imports: [
    MatCardModule,
    MatCheckboxModule,
    MatSelectModule,
    MatIconModule,
    CommonModule,
    MatChipsModule,
    AuthRoutingModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    FormsModule,
    NgxMaskModule.forRoot(maskConfigFunction),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    })

  ],
  providers: [
    PortalAuthService,
    EmailService,
    CurrencyPipe,
    PortalAuthGuard,
  ]
})
export class PortalAuthModule { }

export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}