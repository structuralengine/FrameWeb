import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFixNodeComponent } from './input-fix-node.component';

describe('InputFixNodeComponent', () => {
  let component: InputFixNodeComponent;
  let fixture: ComponentFixture<InputFixNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputFixNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputFixNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
