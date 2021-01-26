import { TestBed } from '@angular/core/testing';

import { PrintInputFixMemberService } from './print-input-fix-member.service';

describe('PrintInputFixMemberService', () => {
  let service: PrintInputFixMemberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputFixMemberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
