import { TestBed } from '@angular/core/testing';

import { PrintResultCombineFsecService } from './print-result-combine-fsec.service';

describe('PrintResultCombineFsecService', () => {
  let service: PrintResultCombineFsecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultCombineFsecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
