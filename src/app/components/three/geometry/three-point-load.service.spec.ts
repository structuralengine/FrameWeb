import { TestBed } from '@angular/core/testing';

import { ThreePointLoadService } from './three-point-load.service';

describe('ThreePointLoadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreePointLoadService = TestBed.get(ThreePointLoadService);
    expect(service).toBeTruthy();
  });
});
