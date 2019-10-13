import { TestBed, inject } from '@angular/core/testing';

import { InputPickupService } from './input-pickup.service';

describe('InputPickupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputPickupService]
    });
  });

  it('should be created', inject([InputPickupService], (service: InputPickupService) => {
    expect(service).toBeTruthy();
  }));
});
