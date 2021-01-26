import { TestBed } from '@angular/core/testing';

import { PrintInputPickupService } from './print-input-pickup.service';

describe('PrintInputPickupService', () => {
  let service: PrintInputPickupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputPickupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
