import { TestBed } from '@angular/core/testing';

import { PrintInputNodesService } from './print-input-nodes.service';

describe('PrintInputNodesService', () => {
  let service: PrintInputNodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputNodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
