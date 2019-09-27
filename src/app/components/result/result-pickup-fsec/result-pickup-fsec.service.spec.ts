import { TestBed, inject } from '@angular/core/testing';

import { ResultPickupFsecService } from './result-pickup-fsec.service';

describe('ResultPickupFsecService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultPickupFsecService]
    });
  });

  it('should be created', inject([ResultPickupFsecService], (service: ResultPickupFsecService) => {
    expect(service).toBeTruthy();
  }));
});
