import { TestBed } from '@angular/core/testing';

import { ThreeFixMemberService } from './three-fix-member.service';

describe('ThreeFixMemberService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ThreeFixMemberService = TestBed.get(ThreeFixMemberService);
    expect(service).toBeTruthy();
  });
});
