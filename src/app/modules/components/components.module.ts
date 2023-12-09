import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { MatIconModule } from '@angular/material/icon';
import { SubmittedFormComponent } from './submitted-form/submitted-form.component';
import { RouterModule } from '@angular/router';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [
    DashboardHeaderComponent,
    SubmittedFormComponent,
    DialogBoxComponent,
  ],
  exports: [DashboardHeaderComponent, SubmittedFormComponent],
  imports: [CommonModule, MatIconModule, RouterModule, MatDialogModule],
})
export class ComponentsModule {}
