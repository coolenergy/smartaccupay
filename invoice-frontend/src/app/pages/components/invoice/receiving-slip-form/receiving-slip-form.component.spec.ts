import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivingSlipFormComponent } from './receiving-slip-form.component';

describe('ReceivingSlipFormComponent', () => {
  let component: ReceivingSlipFormComponent;
  let fixture: ComponentFixture<ReceivingSlipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivingSlipFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivingSlipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
