import { TestBed, inject } from '@angular/core/testing';

import { ResultCombineDisgService } from './result-combine-disg.service';

describe('ResultCombineDisgService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultCombineDisgService]
    });
  });

  it('should be created', inject([ResultCombineDisgService], (service: ResultCombineDisgService) => {
    expect(service).toBeTruthy();
  }));
});
