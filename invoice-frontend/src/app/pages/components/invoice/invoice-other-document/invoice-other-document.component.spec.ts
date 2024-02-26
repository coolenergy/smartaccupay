import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOtherDocumentComponent } from './invoice-other-document.component';

describe('InvoiceOtherDocumentComponent', () => {
  let component: InvoiceOtherDocumentComponent;
  let fixture: ComponentFixture<InvoiceOtherDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceOtherDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceOtherDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
