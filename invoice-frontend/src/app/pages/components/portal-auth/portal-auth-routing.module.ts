import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core'
import { AuthPageComponent } from './containers';
import { ForcefullChangePasswordComponent } from './components/forcefull-change-password/forcefull-change-password.component';

const routes: Routes = [
  {
    path: '',
    component: AuthPageComponent
  },
  {
    path: 'forcefully-changepassword',
    component: ForcefullChangePasswordComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),

  ],
  exports: [RouterModule]
})

export class AuthRoutingModule {
}
