import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgcfFormHeaderComponent } from './igcf-form-header.component';

describe('IgcfFormHeaderComponent', () => {
  let component: IgcfFormHeaderComponent;
  let fixture: ComponentFixture<IgcfFormHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgcfFormHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IgcfFormHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
