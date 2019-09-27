import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultPickupDisgComponent } from './result-pickup-disg.component';

describe('ResultPickupDisgComponent', () => {
  let component: ResultPickupDisgComponent;
  let fixture: ComponentFixture<ResultPickupDisgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultPickupDisgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultPickupDisgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
