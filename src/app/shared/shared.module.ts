import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiModule } from './ui/ui.module';
import { FormStepComponent } from './components/form-step/form-step.component';
import { ComponentsModule } from './components/components.module';

@NgModule({
  declarations: [],
  exports: [UiModule, ComponentsModule],
  imports: [CommonModule, UiModule, ComponentsModule],
})
export class SharedModule {}
