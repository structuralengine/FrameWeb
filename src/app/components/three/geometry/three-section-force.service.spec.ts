import { TestBed } from '@angular/core/testing';

import { ThreeSectionForceService } from './three-section-force.service';

describe('ThreeResultService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeSectionForceService = TestBed.get(ThreeSectionForceService);
    expect(service).toBeTruthy();
  });
});
