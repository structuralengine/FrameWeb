import { TestBed, inject } from '@angular/core/testing';

import { ReadDataService } from './read-data.service';

describe('ReadDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReadDataService]
    });
  });

  it('should be created', inject([ReadDataService], (service: ReadDataService) => {
    expect(service).toBeTruthy();
  }));
});
