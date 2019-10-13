import { TestBed, inject } from '@angular/core/testing';

import { InputDefineService } from './input-define.service';

describe('InputDefineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputDefineService]
    });
  });

  it('should be created', inject([InputDefineService], (service: InputDefineService) => {
    expect(service).toBeTruthy();
  }));
});
