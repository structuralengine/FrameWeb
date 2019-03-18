import { TestBed, inject } from '@angular/core/testing';

import { FrameDataService } from './frame-data.service';

describe('FrameDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FrameDataService]
    });
  });

  it('should be created', inject([FrameDataService], (service: FrameDataService) => {
    expect(service).toBeTruthy();
  }));
});
