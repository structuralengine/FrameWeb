import { TestBed, inject } from '@angular/core/testing';

import { InputDataService } from './input-data.service';

describe('InputDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputDataService]
    });
  });

  it('should be created', inject([InputDataService], (service: InputDataService) => {
    expect(service).toBeTruthy();
  }));
});
