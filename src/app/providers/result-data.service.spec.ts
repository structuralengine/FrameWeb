import { TestBed, inject } from '@angular/core/testing';

import { ResultDataService } from './result-data.service';

describe('ResultDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultDataService]
    });
  });

  it('should be created', inject([ResultDataService], (service: ResultDataService) => {
    expect(service).toBeTruthy();
  }));
});
