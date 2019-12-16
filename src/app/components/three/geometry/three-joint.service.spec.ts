import { TestBed } from '@angular/core/testing';

import { ThreeJointService } from './three-joint.service';

describe('ThreeJointService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeJointService = TestBed.get(ThreeJointService);
    expect(service).toBeTruthy();
  });
});
