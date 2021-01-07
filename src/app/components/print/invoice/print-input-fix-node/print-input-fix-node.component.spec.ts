import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputFixNodeComponent } from './print-input-fix-node.component';

describe('PrintInputFixNodeComponent', () => {
  let component: PrintInputFixNodeComponent;
  let fixture: ComponentFixture<PrintInputFixNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputFixNodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputFixNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
