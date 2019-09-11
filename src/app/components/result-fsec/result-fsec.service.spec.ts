import { TestBed, inject } from '@angular/core/testing';

import { ResultFsecService } from './result-fsec.service';

describe('ResultFsecService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultFsecService]
    });
  });

  it('should be created', inject([ResultFsecService], (service: ResultFsecService) => {
    expect(service).toBeTruthy();
  }));
});
