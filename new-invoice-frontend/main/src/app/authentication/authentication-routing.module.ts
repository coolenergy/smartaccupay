import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockedComponent } from './locked/locked.component';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { ForcefullChangePasswordComponent } from './forcefull-change-password/forcefull-change-password.component';
import { Page404Component } from './page404/page404.component';
import { LoggedInAuthGuard } from '../core/guard/loggedIn.guard';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AuthGuard } from '../core/guard/auth.guard';
const routes: Routes = [
  /* {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  }, */
  {
    path: '',
    component: SigninComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'forcefully-change-password',
    component: ForcefullChangePasswordComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'send-otp',
    component: SendOtpComponent,
    canActivate: [LoggedInAuthGuard],
  },
  {
    path: 'locked',
    component: LockedComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'page404',
    component: Page404Component
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
