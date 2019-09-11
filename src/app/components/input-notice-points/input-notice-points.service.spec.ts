import { TestBed, inject } from '@angular/core/testing';

import { InputNoticePointsService } from './input-notice-points.service';

describe('InputNoticePointsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputNoticePointsService]
    });
  });

  it('should be created', inject([InputNoticePointsService], (service: InputNoticePointsService) => {
    expect(service).toBeTruthy();
  }));
});
