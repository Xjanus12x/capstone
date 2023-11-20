import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { MatIconModule } from '@angular/material/icon';
import { SubmittedFormComponent } from './submitted-form/submitted-form.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [DashboardHeaderComponent, SubmittedFormComponent],
  exports: [DashboardHeaderComponent, SubmittedFormComponent],
  imports: [CommonModule, MatIconModule, RouterModule],
})
export class ComponentsModule {}
