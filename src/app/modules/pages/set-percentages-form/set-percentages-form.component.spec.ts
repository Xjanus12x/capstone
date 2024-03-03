import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPercentagesFormComponent } from './set-percentages-form.component';

describe('SetPercentagesFormComponent', () => {
  let component: SetPercentagesFormComponent;
  let fixture: ComponentFixture<SetPercentagesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetPercentagesFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetPercentagesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
