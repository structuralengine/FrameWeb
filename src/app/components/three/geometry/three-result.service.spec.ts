import { TestBed } from '@angular/core/testing';

import { ThreeResultService } from './three-result.service';

describe('ThreeResultService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeResultService = TestBed.get(ThreeResultService);
    expect(service).toBeTruthy();
  });
});
