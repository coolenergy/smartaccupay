import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceMessageViewComponent } from './invoice-message-view.component';

describe('InvoiceMessageViewComponent', () => {
  let component: InvoiceMessageViewComponent;
  let fixture: ComponentFixture<InvoiceMessageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceMessageViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceMessageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
