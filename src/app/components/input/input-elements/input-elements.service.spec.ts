import { TestBed, inject } from '@angular/core/testing';

import { InputElementsService } from './input-elements.service';

describe('InputElementsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InputElementsService]
    });
  });

  it('should be created', inject([InputElementsService], (service: InputElementsService) => {
    expect(service).toBeTruthy();
  }));
});
