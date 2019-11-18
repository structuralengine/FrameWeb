import { TestBed } from '@angular/core/testing';

import { ThreeMemberLoadService } from './three-member-load.service';

describe('ThreeMemberLoadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeMemberLoadService = TestBed.get(ThreeMemberLoadService);
    expect(service).toBeTruthy();
  });
});
