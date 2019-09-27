import { TestBed, inject } from '@angular/core/testing';

import { ResultCombineReacService } from './result-combine-reac.service';

describe('ResultCombineReacService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultCombineReacService]
    });
  });

  it('should be created', inject([ResultCombineReacService], (service: ResultCombineReacService) => {
    expect(service).toBeTruthy();
  }));
});
