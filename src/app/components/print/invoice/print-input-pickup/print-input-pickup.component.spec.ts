import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputPickupComponent } from './print-input-pickup.component';

describe('PrintInputPickupComponent', () => {
  let component: PrintInputPickupComponent;
  let fixture: ComponentFixture<PrintInputPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputPickupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
