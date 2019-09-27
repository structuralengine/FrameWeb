import { TestBed, inject } from '@angular/core/testing';

import { InputFixMemberService } from './input-fix-member.service';

describe('InputFixMemberService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputFixMemberService]
    });
  });

  it('should be created', inject([InputFixMemberService], (service: InputFixMemberService) => {
    expect(service).toBeTruthy();
  }));
});
