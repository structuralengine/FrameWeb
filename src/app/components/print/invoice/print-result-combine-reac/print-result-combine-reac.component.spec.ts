import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultCombineReacComponent } from './print-result-combine-reac.component';

describe('PrintResultCombineReacComponent', () => {
  let component: PrintResultCombineReacComponent;
  let fixture: ComponentFixture<PrintResultCombineReacComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultCombineReacComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultCombineReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
