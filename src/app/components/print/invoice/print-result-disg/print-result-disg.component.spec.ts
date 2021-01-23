import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultDisgComponent } from './print-result-disg.component';

describe('PrintResultDisgComponent', () => {
  let component: PrintResultDisgComponent;
  let fixture: ComponentFixture<PrintResultDisgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultDisgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
