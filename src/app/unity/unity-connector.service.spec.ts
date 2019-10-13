import { TestBed, inject } from '@angular/core/testing';

import { UnityConnectorService } from './unity-connector.service';

describe('UnityConnectorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnityConnectorService]
    });
  });

  it('should be created', inject([UnityConnectorService], (service: UnityConnectorService) => {
    expect(service).toBeTruthy();
  }));
});
