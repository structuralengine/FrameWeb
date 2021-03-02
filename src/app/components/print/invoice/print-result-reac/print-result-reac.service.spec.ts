import { TestBed } from '@angular/core/testing';

import { PrintResultReacService } from './print-result-reac.service';

describe('PrintResultReacService', () => {
  let service: PrintResultReacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultReacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
