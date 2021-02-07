import { TestBed } from '@angular/core/testing';

import { PrintResultCombineReacService } from './print-result-combine-reac.service';

describe('PrintResultCombineReacService', () => {
  let service: PrintResultCombineReacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultCombineReacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
