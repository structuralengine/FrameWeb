import { TestBed } from '@angular/core/testing';

import { PrintResultPickupReacService } from './print-result-pickup-reac.service';

describe('PrintResultPickupReacService', () => {
  let service: PrintResultPickupReacService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintResultPickupReacService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
