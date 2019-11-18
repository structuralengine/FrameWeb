import { TestBed } from '@angular/core/testing';

import { ThreeFixNodeService } from './three-fix-node.service';

describe('ThreeFixNodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeFixNodeService = TestBed.get(ThreeFixNodeService);
    expect(service).toBeTruthy();
  });
});
