import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputLoadComponent } from './print-input-load.component';

describe('PrintInputLoadComponent', () => {
  let component: PrintInputLoadComponent;
  let fixture: ComponentFixture<PrintInputLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
