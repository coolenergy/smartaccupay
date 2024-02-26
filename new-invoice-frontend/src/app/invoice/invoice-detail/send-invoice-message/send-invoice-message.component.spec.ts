import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendInvoiceMessageComponent } from './send-invoice-message.component';

describe('SendInvoiceMessageComponent', () => {
  let component: SendInvoiceMessageComponent;
  let fixture: ComponentFixture<SendInvoiceMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendInvoiceMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendInvoiceMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
