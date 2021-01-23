import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultCombineDisgComponent } from './print-result-combine-disg.component';

describe('PrintResultCombineDisgComponent', () => {
  let component: PrintResultCombineDisgComponent;
  let fixture: ComponentFixture<PrintResultCombineDisgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultCombineDisgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultCombineDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
