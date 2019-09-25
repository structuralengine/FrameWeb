import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputLoadNameComponent } from './input-load-name.component';

describe('InputLoadNameComponent', () => {
  let component: InputLoadNameComponent;
  let fixture: ComponentFixture<InputLoadNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputLoadNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputLoadNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
