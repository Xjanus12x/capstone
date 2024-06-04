import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatButtonModule} from '@angular/material/button';
import { UpdatePendingUserComponent } from './update-pending-user/update-pending-user.component';
import { ReviewKpisComponent } from './review-kpis/review-kpis.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { UpdateObjAndPlansComponent } from './update-obj-and-plans/update-obj-and-plans.component';
import { UiModule } from 'src/app/shared/ui/ui.module';

@NgModule({
  declarations: [
    SubmittedFormComponent,
    DialogBoxComponent,
    UpdateUserComponent,
    UpdatePendingUserComponent,
    ReviewKpisComponent,
    UpdateObjAndPlansComponent,
  ],
  exports: [SubmittedFormComponent, ReviewKpisComponent],
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
    MatExpansionModule,
    MatTableModule,
    UiModule,
  ],
})
export class ComponentsModule {}
