import { TestBed, inject } from '@angular/core/testing';

import { InputCombineService } from './input-combine.service';

describe('InputCombineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputCombineService]
    });
  });

  it('should be created', inject([InputCombineService], (service: InputCombineService) => {
    expect(service).toBeTruthy();
  }));
});
