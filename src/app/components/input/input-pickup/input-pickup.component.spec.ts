import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPickupComponent } from './input-pickup.component';

describe('InputPickupComponent', () => {
  let component: InputPickupComponent;
  let fixture: ComponentFixture<InputPickupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputPickupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
