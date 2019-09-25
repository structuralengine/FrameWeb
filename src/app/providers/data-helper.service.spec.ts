import { TestBed, inject } from '@angular/core/testing';

import { DataHelperService } from './data-helper.service';

describe('DataHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataHelperService]
    });
  });

  it('should be created', inject([DataHelperService], (service: DataHelperService) => {
    expect(service).toBeTruthy();
  }));
});
