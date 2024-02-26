import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendOtpComponent } from './send-otp.component';

describe('SendOtpComponent', () => {
  let component: SendOtpComponent;
  let fixture: ComponentFixture<SendOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendOtpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
