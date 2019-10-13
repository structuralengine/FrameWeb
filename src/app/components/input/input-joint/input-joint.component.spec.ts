import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputJointComponent } from './input-joint.component';

describe('InputJointComponent', () => {
  let component: InputJointComponent;
  let fixture: ComponentFixture<InputJointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputJointComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputJointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
