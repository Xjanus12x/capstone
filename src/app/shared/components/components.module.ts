import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormStepComponent } from './form-step/form-step.component';
import { MatStepperModule } from '@angular/material/stepper';
import { UiModule } from '../ui/ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormHeaderComponent } from './form-header/form-header.component';
import { NestedListComponent } from './nested-list/nested-list.component';
import { RouterModule } from '@angular/router';
import { PartOneFormComponent } from './part-one-form/part-one-form.component';
import { PartTwoFormComponent } from './part-two-form/part-two-form.component';

@NgModule({
  declarations: [
    FormStepComponent,
    FormHeaderComponent,
    NestedListComponent,
    PartOneFormComponent,
    PartTwoFormComponent,
  ],
  exports: [
    FormStepComponent,
    NestedListComponent,
    PartOneFormComponent,
    PartTwoFormComponent,
  ],
  imports: [
    CommonModule,
    MatStepperModule,
    UiModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterModule,
  ],
})
export class ComponentsModule {}
