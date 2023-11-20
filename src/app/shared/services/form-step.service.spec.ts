import { TestBed } from '@angular/core/testing';

import { FormStepService } from './form-step.service';

describe('FormStepService', () => {
  let service: FormStepService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormStepService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
