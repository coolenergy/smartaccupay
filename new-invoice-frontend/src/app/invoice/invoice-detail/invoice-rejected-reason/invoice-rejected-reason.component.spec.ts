import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceRejectedReasonComponent } from './invoice-rejected-reason.component';

describe('InvoiceRejectedReasonComponent', () => {
  let component: InvoiceRejectedReasonComponent;
  let fixture: ComponentFixture<InvoiceRejectedReasonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceRejectedReasonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceRejectedReasonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
