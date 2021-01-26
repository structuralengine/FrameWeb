import { TestBed } from '@angular/core/testing';

import { PrintInputMembersService } from './print-input-members.service';

describe('PrintInputMembersService', () => {
  let service: PrintInputMembersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputMembersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
