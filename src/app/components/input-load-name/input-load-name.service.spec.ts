import { TestBed, inject } from '@angular/core/testing';

import { InputLoadNameService } from './input-load-name.service';

describe('InputLoadNameService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputLoadNameService]
    });
  });

  it('should be created', inject([InputLoadNameService], (service: InputLoadNameService) => {
    expect(service).toBeTruthy();
  }));
});
