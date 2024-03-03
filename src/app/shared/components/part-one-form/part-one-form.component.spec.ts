import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartOneFormComponent } from './part-one-form.component';

describe('PartOneFormComponent', () => {
  let component: PartOneFormComponent;
  let fixture: ComponentFixture<PartOneFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartOneFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartOneFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
