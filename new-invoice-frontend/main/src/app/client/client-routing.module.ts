import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { ClientHistoryComponent } from './client-history/client-history.component';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
  },
  {
    path: WEB_ROUTES.FORM,
    component: ClientFormComponent,
  },
  {
    path: WEB_ROUTES.HISTORY,
    component: ClientHistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
