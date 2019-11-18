import { TestBed } from '@angular/core/testing';

import { ThreeMembersService } from './three-members.service';

describe('ThreeMembersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeMembersService = TestBed.get(ThreeMembersService);
    expect(service).toBeTruthy();
  });
});
