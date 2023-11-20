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

@NgModule({
  declarations: [FormStepComponent, FormHeaderComponent],
  exports: [FormStepComponent],
  imports: [
    CommonModule,
    MatStepperModule,
    UiModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
 
  ],
})
export class ComponentsModule {}
