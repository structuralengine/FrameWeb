import { TestBed } from '@angular/core/testing';

import { ThreeLoadService } from './three-load.service';

describe('ThreeLoadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeLoadService = TestBed.get(ThreeLoadService);
    expect(service).toBeTruthy();
  });
});
