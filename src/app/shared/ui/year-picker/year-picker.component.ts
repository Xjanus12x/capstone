import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import * as _moment from 'moment';
import { Moment } from 'moment';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';

const moment = _moment;
export const YEAR_PICKER_FORMAT = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-year-picker',
  templateUrl: './year-picker.component.html',
  styleUrls: ['./year-picker.component.css'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: YEAR_PICKER_FORMAT,
    },
  ],
})
export class YearPickerComponent {
  constructor() {}
  minDate: Date = new Date();
  @Input('yearControl') control = new FormControl(moment());
  @Input() label: string = '';
  @Input() setYears!: string;
  ngOnInit() {
    if (this.setYears) this.control.setValue(moment(this.setYears));
  }
  // setYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
  //   const ctrlValue = this.control.value!;
  //   ctrlValue.year(normalizedMonthAndYear.year());
  //   this.control.setValue(ctrlValue);
  //   datepicker.close();
  // }
  setYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.control.value;
    if (ctrlValue) {
      ctrlValue.year(normalizedMonthAndYear.year());
      this.control.setValue(ctrlValue);
      datepicker.close();
    }
  }
}
