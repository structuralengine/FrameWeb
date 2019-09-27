import { TestBed, inject } from '@angular/core/testing';

import { ResultCombineFsecService } from './result-combine-fsec.service';

describe('ResultCombineFsecService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResultCombineFsecService]
    });
  });

  it('should be created', inject([ResultCombineFsecService], (service: ResultCombineFsecService) => {
    expect(service).toBeTruthy();
  }));
});
