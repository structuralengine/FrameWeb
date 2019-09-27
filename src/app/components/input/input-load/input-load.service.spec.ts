import { TestBed, inject } from '@angular/core/testing';

import { InputLoadService } from './input-load.service';

describe('InputLoadService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputLoadService]
    });
  });

  it('should be created', inject([InputLoadService], (service: InputLoadService) => {
    expect(service).toBeTruthy();
  }));
});
