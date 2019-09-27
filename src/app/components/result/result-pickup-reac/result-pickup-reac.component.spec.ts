import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultPickupReacComponent } from './result-pickup-reac.component';

describe('ResultPickupReacComponent', () => {
  let component: ResultPickupReacComponent;
  let fixture: ComponentFixture<ResultPickupReacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultPickupReacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultPickupReacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
