import { TestBed, inject } from '@angular/core/testing';

import { ResultReacService } from './result-reac.service';

describe('ResultReacService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultReacService]
    });
  });

  it('should be created', inject([ResultReacService], (service: ResultReacService) => {
    expect(service).toBeTruthy();
  }));
});
