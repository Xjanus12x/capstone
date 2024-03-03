import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardHeaderComponent } from './dashboard-header/dashboard-header.component';
import { MatIconModule } from '@angular/material/icon';
import { SubmittedFormComponent } from './submitted-form/submitted-form.component';
import { RouterModule } from '@angular/router';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { UpdateUserComponent } from './update-user/update-user.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    DashboardHeaderComponent,
    SubmittedFormComponent,
    DialogBoxComponent,
    UpdateUserComponent,
  ],
  exports: [DashboardHeaderComponent, SubmittedFormComponent],
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    MatDialogModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    AngularSignaturePadModule,
    MatSelectModule,
    MatButtonModule,
  ],
})
export class ComponentsModule {}
