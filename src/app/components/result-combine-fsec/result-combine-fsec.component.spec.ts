import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCombineFsecComponent } from './result-combine-fsec.component';

describe('ResultCombineFsecComponent', () => {
  let component: ResultCombineFsecComponent;
  let fixture: ComponentFixture<ResultCombineFsecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultCombineFsecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCombineFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
