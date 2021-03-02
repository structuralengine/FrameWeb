import { TestBed } from '@angular/core/testing';

import { PrintResultPickupDisgService } from './print-result-pickup-disg.service';

describe('PrintResultPickupDisgService', () => {
  let service: PrintResultPickupDisgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultPickupDisgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
