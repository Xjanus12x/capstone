import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAllKpisComponent } from './input-all-kpis.component';

describe('InputAllKpisComponent', () => {
  let component: InputAllKpisComponent;
  let fixture: ComponentFixture<InputAllKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputAllKpisComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputAllKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
