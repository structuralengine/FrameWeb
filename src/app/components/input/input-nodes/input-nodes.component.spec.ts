import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InputNodesComponent } from './input-nodes.component';

describe('InputNodesComponent', () => {
  let component: InputNodesComponent;
  let fixture: ComponentFixture<InputNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputNodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
