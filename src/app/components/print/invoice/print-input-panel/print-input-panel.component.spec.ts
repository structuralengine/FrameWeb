import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputPanelComponent } from './print-input-panel.component';

describe('PrintInputPanelComponent', () => {
  let component: PrintInputPanelComponent;
  let fixture: ComponentFixture<PrintInputPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
