import { TestBed } from '@angular/core/testing';

import { ThreeNodesService } from './three-nodes.service';

describe('ThreeNodesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeNodesService = TestBed.get(ThreeNodesService);
    expect(service).toBeTruthy();
  });
});
