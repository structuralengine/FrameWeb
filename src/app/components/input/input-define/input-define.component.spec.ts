import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputDefineComponent } from './input-define.component';

describe('InputDefineComponent', () => {
  let component: InputDefineComponent;
  let fixture: ComponentFixture<InputDefineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputDefineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDefineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
