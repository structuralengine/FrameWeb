import { TestBed } from '@angular/core/testing';

import { PrintInputDefineService } from './print-input-define.service';

describe('PrintInputDefineService', () => {
  let service: PrintInputDefineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputDefineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
