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
import { SetPercentagesFormComponent } from './modules/pages/set-percentages-form/set-percentages-form.component';
import { canAccessSettingPercentages } from './core/guards/canAccessSettingPercentages.guard';
import { ViewIgcfComponent } from './modules/pages/view-igcf/view-igcf.component';
import { UserListComponent } from './modules/pages/user-list/user-list.component';
import { ReportsComponent } from './modules/pages/reports/reports.component';
import { PercentagesListComponent } from './modules/pages/percentages-list/percentages-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'register',
    component: RegisterComponent,
    canDeactivate: [canExit],
    canActivate: [canActivate, canActivateAdminRoutes],
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
        path: 'fill-up',
        component: IgcfFormComponent,
        outlet: 'dashboardContent',
        canActivate: [canAccessSettingPercentages],
        canDeactivate: [canExit],
      },
      {
        path: 'submitted-form/:id/:isSigned',
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
        path: 'set-percentages',
        component: SetPercentagesFormComponent,
        outlet: 'dashboardContent',
        canDeactivate: [canExit],
      },
      {
        path: 'percentages-list',
        component: PercentagesListComponent,
        outlet: 'dashboardContent',
      },
      {
        path: 'reports',
        component: ReportsComponent,
        outlet: 'dashboardContent',
      },
    ],
  },
  {
    path: 'reports',
    component: ReportsComponent,
    // outlet: 'dashboardContent',
  },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
