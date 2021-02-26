import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultPickupDisgComponent } from './print-result-pickup-disg.component';

describe('PrintResultPickupDisgComponent', () => {
  let component: PrintResultPickupDisgComponent;
  let fixture: ComponentFixture<PrintResultPickupDisgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultPickupDisgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultPickupDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
