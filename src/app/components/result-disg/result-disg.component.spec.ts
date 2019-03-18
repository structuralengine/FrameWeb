import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultDisgComponent } from './result-disg.component';

describe('ResultDisgComponent', () => {
  let component: ResultDisgComponent;
  let fixture: ComponentFixture<ResultDisgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultDisgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
