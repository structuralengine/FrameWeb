import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultFsecComponent } from './result-fsec.component';

describe('ResultFsecComponent', () => {
  let component: ResultFsecComponent;
  let fixture: ComponentFixture<ResultFsecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultFsecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
