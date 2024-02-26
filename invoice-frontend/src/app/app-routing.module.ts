import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './pages/components/landing-page/landing-page.component'
import { IframeCustomepdfviewerComponent } from './common-components/iframe-customepdfviewer/iframe-customepdfviewer.component';

const routes: Routes = [

  {
    path: 'login',
    loadChildren: () => import('./pages/components/portal-auth/portal-auth.module').then(m => m.PortalAuthModule)
  },

  {
    path: 'landing-page',
    pathMatch: 'full',
    component: LandingPageComponent
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule)
  },





  {
    path: 'app-iframe-customepdfviewer/:id/:vendorid',
    pathMatch: 'full',
    component: IframeCustomepdfviewerComponent,
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
//useHash: false, relativeLinkResolution: 'legacy'
export class AppRoutingModule { }
