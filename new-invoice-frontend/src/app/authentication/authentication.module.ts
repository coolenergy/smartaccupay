import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { SigninComponent } from './signin/signin.component';
import { LockedComponent } from './locked/locked.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { AuthenticationService } from './authentication.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMaskModule } from 'ngx-mask';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { ForcefullChangePasswordComponent } from './forcefull-change-password/forcefull-change-password.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChangePasswordComponent } from './change-password/change-password.component';

@NgModule({
  declarations: [
    SigninComponent,
    LockedComponent,
    ForgotPasswordComponent,
    SendOtpComponent,
    ForcefullChangePasswordComponent,
    ChangePasswordComponent
  ],
  providers: [AuthenticationService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatListModule,
    MatSnackBarModule,
    NgxMaskModule,
    NgOtpInputModule,
    TranslateModule,
    MatTooltipModule
  ]
})
export class AuthenticationModule { }
