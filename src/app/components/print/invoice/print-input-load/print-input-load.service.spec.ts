import { TestBed } from '@angular/core/testing';

import { PrintInputLoadService } from './print-input-load.service';

describe('PrintInputLoadService', () => {
  let service: PrintInputLoadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputLoadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
