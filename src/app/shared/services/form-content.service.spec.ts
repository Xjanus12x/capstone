import { TestBed } from '@angular/core/testing';

import { FormContentService } from './form-content.service';

describe('FormContentService', () => {
  let service: FormContentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormContentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
