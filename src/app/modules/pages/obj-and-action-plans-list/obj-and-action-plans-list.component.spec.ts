import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjAndActionPlansListComponent } from './obj-and-action-plans-list.component';

describe('ObjAndActionPlansListComponent', () => {
  let component: ObjAndActionPlansListComponent;
  let fixture: ComponentFixture<ObjAndActionPlansListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjAndActionPlansListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObjAndActionPlansListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
