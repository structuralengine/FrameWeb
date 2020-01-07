import { TestBed } from '@angular/core/testing';

import { ThreeReactService } from './three-react.service';

describe('ThreeReactService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeReactService = TestBed.get(ThreeReactService);
    expect(service).toBeTruthy();
  });
});
