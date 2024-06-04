import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateObjAndPlansComponent } from './update-obj-and-plans.component';

describe('UpdateObjAndPlansComponent', () => {
  let component: UpdateObjAndPlansComponent;
  let fixture: ComponentFixture<UpdateObjAndPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateObjAndPlansComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateObjAndPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
