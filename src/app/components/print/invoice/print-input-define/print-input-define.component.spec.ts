import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputDefineComponent } from './print-input-define.component';

describe('PrintInputDefineComponent', () => {
  let component: PrintInputDefineComponent;
  let fixture: ComponentFixture<PrintInputDefineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputDefineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputDefineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
