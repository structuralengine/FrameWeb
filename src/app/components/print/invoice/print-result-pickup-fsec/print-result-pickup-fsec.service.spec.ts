import { TestBed } from '@angular/core/testing';

import { PrintResultPickupFsecService } from './print-result-pickup-fsec.service';

describe('PrintResultPickupFseService', () => {
  let service: PrintResultPickupFsecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultPickupFsecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
