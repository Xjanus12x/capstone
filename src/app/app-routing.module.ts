import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './modules/pages/login/login.component';
import { DashboardComponent } from './modules/pages/dashboard/dashboard.component';
import { RegisterComponent } from './modules/pages/register/register.component';
import { IgcfFormComponent } from './modules/pages/igcf-form/igcf-form.component';
import { canExit } from './core/guards/canExit.guard';
import {
  canActivate,
  canActivateAdminRoutes,
} from './core/guards/checkAccess.guard';
import { ViewIgcfComponent } from './modules/pages/view-igcf/view-igcf.component';
import { UserListComponent } from './modules/pages/user-list/user-list.component';
import { ReportsComponent } from './modules/pages/reports/reports.component';
import { PendingUserListComponent } from './modules/pages/pending-user-list/pending-user-list.component';
import { InputAllKpisComponent } from './modules/pages/input-all-kpis/input-all-kpis.component';
import { ActionPlansComponent } from './modules/pages/action-plans/action-plans.component';
import { ObjAndActionPlansListComponent } from './modules/pages/obj-and-action-plans-list/obj-and-action-plans-list.component';
import { canAcessFillUpIgcf } from './core/guards/canAccessFillUpIgcf.guard';
import { AuditTrailComponent } from './modules/pages/audit-trail/audit-trail.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegisterComponent,
    canDeactivate: [canExit],
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [canActivate],
    children: [
      {
        path: 'user-list',
        component: UserListComponent,
        outlet: 'dashboardContent',
        canActivate: [canActivateAdminRoutes],
      },
      {
        path: 'pending-user-list',
        component: PendingUserListComponent,
        outlet: 'dashboardContent',
        canActivate: [canActivateAdminRoutes],
      },
      {
        path: 'fill-up',
        component: IgcfFormComponent,
        outlet: 'dashboardContent',
        canActivate: [canAcessFillUpIgcf],
        canDeactivate: [canExit],
      },
      {
        path: 'submitted-form/:id',
        component: IgcfFormComponent,
        outlet: 'dashboardContent',
        canDeactivate: [canExit],
      },
      {
        path: 'view-igcf/:id',
        component: ViewIgcfComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'create-objectives',
        component: InputAllKpisComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'action-plans',
        component: ActionPlansComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'obj-and-action-plan-list',
        component: ObjAndActionPlansListComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'reports',
        component: ReportsComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'logs',
        component: AuditTrailComponent,
        outlet: 'dashboardContent',
      },
    ],
  },
  {
    path: 'view-igcf',
    component: ViewIgcfComponent,
  },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
