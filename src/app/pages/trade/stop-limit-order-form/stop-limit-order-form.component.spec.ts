import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StopLimitOrderFormComponent } from './stop-limit-order-form.component';

describe('StopLimitOrderFormComponent', () => {
  let component: StopLimitOrderFormComponent;
  let fixture: ComponentFixture<StopLimitOrderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StopLimitOrderFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StopLimitOrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
