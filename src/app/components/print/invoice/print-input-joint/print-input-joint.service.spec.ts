import { TestBed } from '@angular/core/testing';

import { PrintInputJointService } from './print-input-joint.service';

describe('PrintInputJointService', () => {
  let service: PrintInputJointService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputJointService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
