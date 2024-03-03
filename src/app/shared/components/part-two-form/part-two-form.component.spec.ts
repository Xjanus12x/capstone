import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartTwoFormComponent } from './part-two-form.component';

describe('PartTwoFormComponent', () => {
  let component: PartTwoFormComponent;
  let fixture: ComponentFixture<PartTwoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartTwoFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartTwoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
