import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputComponent } from './input/input.component';
import { IgcfFormHeaderComponent } from './igcf-form-header/igcf-form-header.component';
import { MatDatepickerModule } from '@angular/material/datepicker';

@NgModule({
  declarations: [InputComponent, IgcfFormHeaderComponent],
  exports: [InputComponent, IgcfFormHeaderComponent],
  imports: [CommonModule, MatFormFieldModule, MatDatepickerModule],
})
export class UiModule {}
