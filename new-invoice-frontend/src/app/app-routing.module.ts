import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './core/guard/auth.guard';
import { WEB_ROUTES } from 'src/consts/routes';
import { Page404Component } from './authentication/page404/page404.component';
const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: WEB_ROUTES.LOGIN, pathMatch: 'full' },
      {
        path: WEB_ROUTES.SIDEMENU_DASHBOARD,
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_VENDOR,
        loadChildren: () =>
          import('./vendors/vendors.module').then((m) => m.VendorsModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_CLIENT,
        loadChildren: () =>
          import('./client/client.module').then((m) => m.ClientModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_INVOICE,
        loadChildren: () =>
          import('./invoice/invoice.module').then((m) => m.InvoiceModule),
      },

      {
        path: WEB_ROUTES.SIDEMENU_DOCUMENTS,
        loadChildren: () =>
          import('./documents/documents.module').then((m) => m.DocumentsModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_REPORTS,
        loadChildren: () =>
          import('./reports/reports.module').then((m) => m.ReportsModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_USER,
        loadChildren: () =>
          import('./users/users.module').then((m) => m.UsersModule),
      },
      {
        path: WEB_ROUTES.SIDEMENU_SETTINGS,
        loadChildren: () =>
          import('./settings/settings.module').then((m) => m.SettingsModule),
      },
    ],
  },
  {
    path: 'common',
    loadChildren: () =>
      import('./common-components/common-components.module').then((m) => m.CommonComponentsModule),
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  { path: '**', component: Page404Component },
];
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
