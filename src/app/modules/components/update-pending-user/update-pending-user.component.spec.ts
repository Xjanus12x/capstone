import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePendingUserComponent } from './update-pending-user.component';

describe('UpdatePendingUserComponent', () => {
  let component: UpdatePendingUserComponent;
  let fixture: ComponentFixture<UpdatePendingUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePendingUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePendingUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
