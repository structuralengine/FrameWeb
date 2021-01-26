import { TestBed } from '@angular/core/testing';

import { PrintInputElementsService } from './print-input-elements.service';

describe('PrintInputElementsService', () => {
  let service: PrintInputElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
