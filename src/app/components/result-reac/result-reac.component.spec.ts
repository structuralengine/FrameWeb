import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultReacComponent } from './result-reac.component';

describe('ResultReacComponent', () => {
  let component: ResultReacComponent;
  let fixture: ComponentFixture<ResultReacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultReacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
