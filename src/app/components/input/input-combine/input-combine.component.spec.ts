import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCombineComponent } from './input-combine.component';

describe('InputCombineComponent', () => {
  let component: InputCombineComponent;
  let fixture: ComponentFixture<InputCombineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputCombineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputCombineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
