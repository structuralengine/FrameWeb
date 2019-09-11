import { TestBed, inject } from '@angular/core/testing';

import { InputFixNodeService } from './input-fix-node.service';

describe('InputFixNodeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputFixNodeService]
    });
  });

  it('should be created', inject([InputFixNodeService], (service: InputFixNodeService) => {
    expect(service).toBeTruthy();
  }));
});
