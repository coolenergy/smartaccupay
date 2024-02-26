import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceMessagesComponent } from './invoice-messages.component';

describe('InvoiceMessagesComponent', () => {
  let component: InvoiceMessagesComponent;
  let fixture: ComponentFixture<InvoiceMessagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceMessagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
