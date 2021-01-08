import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultPickupReacComponent } from './print-result-pickup-reac.component';

describe('PrintResultPickupReacComponent', () => {
  let component: PrintResultPickupReacComponent;
  let fixture: ComponentFixture<PrintResultPickupReacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultPickupReacComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultPickupReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
