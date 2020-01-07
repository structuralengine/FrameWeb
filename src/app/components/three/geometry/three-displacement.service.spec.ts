import { TestBed } from '@angular/core/testing';

import { ThreeDisplacementService } from './three-displacement.service';

describe('ThreeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeDisplacementService = TestBed.get(ThreeDisplacementService);
    expect(service).toBeTruthy();
  });
});
