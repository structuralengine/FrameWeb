import { TestBed } from '@angular/core/testing';

import { PrintResultFsecService } from './print-result-fsec.service';

describe('PrintResultFsecService', () => {
  let service: PrintResultFsecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultFsecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
