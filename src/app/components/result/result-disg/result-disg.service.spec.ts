import { TestBed, inject } from '@angular/core/testing';

import { ResultDisgService } from './result-disg.service';

describe('ResultDisgService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultDisgService]
    });
  });

  it('should be created', inject([ResultDisgService], (service: ResultDisgService) => {
    expect(service).toBeTruthy();
  }));
});
