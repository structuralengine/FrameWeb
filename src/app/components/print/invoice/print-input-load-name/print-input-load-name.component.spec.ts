import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputLoadNameComponent } from './print-input-load-name.component';

describe('PrintInputLoadNameComponent', () => {
  let component: PrintInputLoadNameComponent;
  let fixture: ComponentFixture<PrintInputLoadNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputLoadNameComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputLoadNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
