import { TestBed, inject } from '@angular/core/testing';

import { InputNodesService } from './input-nodes.service';

describe('InputNodesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputNodesService]
    });
  });

  it('should be created', inject([InputNodesService], (service: InputNodesService) => {
    expect(service).toBeTruthy();
  }));
});
