import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputJointComponent } from './print-input-joint.component';

describe('PrintInputJointComponent', () => {
  let component: PrintInputJointComponent;
  let fixture: ComponentFixture<PrintInputJointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputJointComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputJointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
