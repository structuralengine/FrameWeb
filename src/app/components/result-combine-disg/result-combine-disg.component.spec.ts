import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultCombineDisgComponent } from './result-combine-disg.component';

describe('ResultCombineDisgComponent', () => {
  let component: ResultCombineDisgComponent;
  let fixture: ComponentFixture<ResultCombineDisgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultCombineDisgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultCombineDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
