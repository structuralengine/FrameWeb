import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultFsecComponent } from './print-result-fsec.component';

describe('PrintResultFsecComponent', () => {
  let component: PrintResultFsecComponent;
  let fixture: ComponentFixture<PrintResultFsecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultFsecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
