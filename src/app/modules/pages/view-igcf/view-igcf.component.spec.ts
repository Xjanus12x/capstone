import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewIgcfComponent } from './view-igcf.component';

describe('ViewIgcfComponent', () => {
  let component: ViewIgcfComponent;
  let fixture: ComponentFixture<ViewIgcfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewIgcfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewIgcfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
