import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { VendorHistoryComponent } from './vendor-history/vendor-history.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { VendorGridComponent } from './vendor-grid/vendor-grid.component';

const routes: Routes = [
  {
    path: '',
    component: VendorsListComponent
  },
  {
    path: WEB_ROUTES.FORM,
    component: VendorFormComponent
  },
  {
    path: WEB_ROUTES.HISTORY,
    component: VendorHistoryComponent
  },
  {
    path: WEB_ROUTES.GRID,
    component: VendorGridComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorsRoutingModule { }
