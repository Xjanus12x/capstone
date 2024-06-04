import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthDayPickerComponent } from './month-day-picker.component';

describe('MonthDayPickerComponent', () => {
  let component: MonthDayPickerComponent;
  let fixture: ComponentFixture<MonthDayPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthDayPickerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthDayPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
