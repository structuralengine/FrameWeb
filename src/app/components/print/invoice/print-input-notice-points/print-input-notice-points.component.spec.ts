import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputNoticePointsComponent } from './print-input-notice-points.component';

describe('PrintInputNoticePointsComponent', () => {
  let component: PrintInputNoticePointsComponent;
  let fixture: ComponentFixture<PrintInputNoticePointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputNoticePointsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputNoticePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
