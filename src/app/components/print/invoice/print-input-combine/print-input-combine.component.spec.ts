import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputCombineComponent } from './print-input-combine.component';

describe('PrintInputCombineComponent', () => {
  let component: PrintInputCombineComponent;
  let fixture: ComponentFixture<PrintInputCombineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputCombineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputCombineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
