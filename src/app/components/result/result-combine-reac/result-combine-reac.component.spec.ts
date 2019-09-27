import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCombineReacComponent } from './result-combine-reac.component';

describe('ResultCombineReacComponent', () => {
  let component: ResultCombineReacComponent;
  let fixture: ComponentFixture<ResultCombineReacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultCombineReacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCombineReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
