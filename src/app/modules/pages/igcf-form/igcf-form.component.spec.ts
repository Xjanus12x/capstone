import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgcfFormComponent } from './igcf-form.component';

describe('IgcfFormComponent', () => {
  let component: IgcfFormComponent;
  let fixture: ComponentFixture<IgcfFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgcfFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IgcfFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
