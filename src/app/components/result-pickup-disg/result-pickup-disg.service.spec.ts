import { TestBed, inject } from '@angular/core/testing';

import { ResultPickupDisgService } from './result-pickup-disg.service';

describe('ResultPickupDisgService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultPickupDisgService]
    });
  });

  it('should be created', inject([ResultPickupDisgService], (service: ResultPickupDisgService) => {
    expect(service).toBeTruthy();
  }));
});
