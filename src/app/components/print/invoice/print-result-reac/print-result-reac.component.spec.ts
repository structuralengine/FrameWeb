import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultReacComponent } from './print-result-reac.component';

describe('PrintResultReacComponent', () => {
  let component: PrintResultReacComponent;
  let fixture: ComponentFixture<PrintResultReacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultReacComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
