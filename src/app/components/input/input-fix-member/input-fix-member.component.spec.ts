import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFixMemberComponent } from './input-fix-member.component';

describe('InputFixMemberComponent', () => {
  let component: InputFixMemberComponent;
  let fixture: ComponentFixture<InputFixMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputFixMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFixMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
