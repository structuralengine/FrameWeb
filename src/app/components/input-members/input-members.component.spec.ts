import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputMembersComponent } from './input-members.component';

describe('InputMembersComponent', () => {
  let component: InputMembersComponent;
  let fixture: ComponentFixture<InputMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InputMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
