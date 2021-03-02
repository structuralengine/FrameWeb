import { TestBed } from '@angular/core/testing';

import { PrintResultCombineDisgService } from './print-result-combine-disg.service';

describe('PrintResultCombineDisgService', () => {
  let service: PrintResultCombineDisgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultCombineDisgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
