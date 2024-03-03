import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from './input/input.component';
import { IgcfFormHeaderComponent } from './igcf-form-header/igcf-form-header.component';

@NgModule({
  declarations: [InputComponent, IgcfFormHeaderComponent],
  exports: [InputComponent, IgcfFormHeaderComponent],
  imports: [CommonModule, MatFormFieldModule],
})
export class UiModule {}
