import { TestBed } from '@angular/core/testing';

import { PrintResultDisgService } from './print-result-disg.service';

describe('PrintResultDisgService', () => {
  let service: PrintResultDisgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultDisgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
