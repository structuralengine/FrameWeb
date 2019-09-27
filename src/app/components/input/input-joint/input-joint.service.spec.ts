import { TestBed, inject } from '@angular/core/testing';

import { InputJointService } from './input-joint.service';

describe('InputJointService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputJointService]
    });
  });

  it('should be created', inject([InputJointService], (service: InputJointService) => {
    expect(service).toBeTruthy();
  }));
});
