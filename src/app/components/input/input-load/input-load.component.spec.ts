import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputLoadComponent } from './input-load.component';

describe('InputLoadComponent', () => {
  let component: InputLoadComponent;
  let fixture: ComponentFixture<InputLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
