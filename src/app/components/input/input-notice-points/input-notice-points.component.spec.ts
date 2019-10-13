import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNoticePointsComponent } from './input-notice-points.component';

describe('InputNoticePointsComponent', () => {
  let component: InputNoticePointsComponent;
  let fixture: ComponentFixture<InputNoticePointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputNoticePointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputNoticePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
