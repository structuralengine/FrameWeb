import { TestBed } from '@angular/core/testing';

import { PrintInputPanelService } from './print-input-panel.service';

describe('PrintInputPanelService', () => {
  let service: PrintInputPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintInputPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
