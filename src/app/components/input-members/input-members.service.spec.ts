import { TestBed, inject } from '@angular/core/testing';

import { InputMembersService } from './input-members.service';

describe('InputMembersService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputMembersService]
    });
  });

  it('should be created', inject([InputMembersService], (service: InputMembersService) => {
    expect(service).toBeTruthy();
  }));
});
