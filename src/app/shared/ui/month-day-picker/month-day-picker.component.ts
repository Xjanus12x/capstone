import { ChangeDetectorRef, Component, Inject, Input } from '@angular/core';
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
  MatDateFormats,
  NativeDateAdapter,
} from '@angular/material/core';
import { FormControl, Validators } from '@angular/forms';

const moment = _moment;
// export const MONTH_AND_DAY_PICKER_FORMAT = {
//   parse: {
//     dateInput: 'MM-DD',
//   },
//   display: {
//     dateInput: 'MMM D',
//     monthYearLabel: 'MMM D',
//     monthYearA11yLabel: 'MMM D', // Accessibility label for month and year
//   },
// };
export class AppDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    // use what format you need
    return moment(date).format('DD MMM');
  }
}
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MMM',
  },
  display: {
    dateInput: 'DD/MMM',
    monthYearLabel: 'MMM',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-month-day-picker',
  templateUrl: './month-day-picker.component.html',
  styleUrls: ['./month-day-picker.component.css'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: DateAdapter, useClass: AppDateAdapter },
  ],
})
export class MonthDayPickerComponent {
  minDate: Date = new Date();
  @Input('monthAndDayControl') control!: FormControl;
  @Input('setMonthAndDay') monthAndDay!: any;
  ngOnInit() {
    if (this.monthAndDay) this.control.setValue(this.monthAndDay);
  }
  @Input() label: string = '';
}
