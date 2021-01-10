import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultPickupFsecComponent } from './print-result-pickup-fsec.component';

describe('PrintResultPickupFsecComponent', () => {
  let component: PrintResultPickupFsecComponent;
  let fixture: ComponentFixture<PrintResultPickupFsecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultPickupFsecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultPickupFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
