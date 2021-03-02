import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintInputFixMemberComponent } from './print-input-fix-member.component';

describe('PrintInputFixMemberComponent', () => {
  let component: PrintInputFixMemberComponent;
  let fixture: ComponentFixture<PrintInputFixMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintInputFixMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintInputFixMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
