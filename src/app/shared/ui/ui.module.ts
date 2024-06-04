import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IgcfFormHeaderComponent } from './igcf-form-header/igcf-form-header.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { YearPickerComponent } from './year-picker/year-picker.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MonthDayPickerComponent } from './month-day-picker/month-day-picker.component';

@NgModule({
  declarations: [
    IgcfFormHeaderComponent,
    YearPickerComponent,
    MonthDayPickerComponent,
  ],
  exports: [
    IgcfFormHeaderComponent,
    YearPickerComponent,
    MonthDayPickerComponent,
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
})
export class UiModule {}
