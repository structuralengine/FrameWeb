import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputElementsComponent } from './print-input-elements.component';

describe('PrintInputElementsComponent', () => {
  let component: PrintInputElementsComponent;
  let fixture: ComponentFixture<PrintInputElementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputElementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputElementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
