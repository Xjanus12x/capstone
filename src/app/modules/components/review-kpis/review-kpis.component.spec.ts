import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewKpisComponent } from './review-kpis.component';

describe('ReviewKpisComponent', () => {
  let component: ReviewKpisComponent;
  let fixture: ComponentFixture<ReviewKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewKpisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
