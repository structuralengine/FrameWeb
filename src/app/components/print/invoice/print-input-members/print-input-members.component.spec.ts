import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputMembersComponent } from './print-input-members.component';

describe('PrintInputMembersComponent', () => {
  let component: PrintInputMembersComponent;
  let fixture: ComponentFixture<PrintInputMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputMembersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
