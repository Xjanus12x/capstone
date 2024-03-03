import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ComponentsModule as CoreModuleComponents } from 'src/app/core/components/components.module';
import { RouterModule } from '@angular/router';
import { IgcfFormComponent } from './igcf-form/igcf-form.component';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule as SharedeModuleComponents } from 'src/app/shared/components/components.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { ComponentsModule } from '../components/components.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';
import { UiModule } from 'src/app/shared/ui/ui.module';
import { MatTabsModule } from '@angular/material/tabs';
import { SetPercentagesFormComponent } from './set-percentages-form/set-percentages-form.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewIgcfComponent } from './view-igcf/view-igcf.component';
import { UserListComponent } from './user-list/user-list.component';
import { ReportsComponent } from './reports/reports.component';
import { MatDialogModule } from '@angular/material/dialog';
import { PercentagesListComponent } from './percentages-list/percentages-list.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    IgcfFormComponent,
    SetPercentagesFormComponent,
    ViewIgcfComponent,
    UserListComponent,
    ReportsComponent,
    PercentagesListComponent,
  ],
  exports: [LoginComponent, RegisterComponent, DashboardComponent],
  imports: [
    CommonModule,
    CoreModuleComponents,
    SharedeModuleComponents,
    ComponentsModule,
    MatIconModule,
    MatInputModule,
    MatStepperModule,
    MatButtonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AngularSignaturePadModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule,
    HttpClientModule,
    UiModule,
    MatTabsModule,
    MatPaginatorModule,
    MatTableModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatRippleModule,
    MatTooltipModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    
  ],
  providers: [],
})
export class PagesModule {}
