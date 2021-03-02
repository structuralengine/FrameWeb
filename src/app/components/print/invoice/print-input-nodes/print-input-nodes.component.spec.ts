import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputNodesComponent } from './print-input-nodes.component';

describe('PrintInputNodesComponent', () => {
  let component: PrintInputNodesComponent;
  let fixture: ComponentFixture<PrintInputNodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputNodesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
