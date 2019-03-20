import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultPickupFsecComponent } from './result-pickup-fsec.component';

describe('ResultPickupFsecComponent', () => {
  let component: ResultPickupFsecComponent;
  let fixture: ComponentFixture<ResultPickupFsecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultPickupFsecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultPickupFsecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
