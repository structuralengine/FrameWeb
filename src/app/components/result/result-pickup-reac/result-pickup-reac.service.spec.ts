import { TestBed, inject } from '@angular/core/testing';

import { ResultPickupReacService } from './result-pickup-reac.service';

describe('ResultPickupReacService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultPickupReacService]
    });
  });

  it('should be created', inject([ResultPickupReacService], (service: ResultPickupReacService) => {
    expect(service).toBeTruthy();
  }));
});
