import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintResultCombineFsecComponent } from './print-result-combine-fsec.component';

describe('PrintResultCombineFsecComponent', () => {
  let component: PrintResultCombineFsecComponent;
  let fixture: ComponentFixture<PrintResultCombineFsecComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintResultCombineFsecComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintResultCombineFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
