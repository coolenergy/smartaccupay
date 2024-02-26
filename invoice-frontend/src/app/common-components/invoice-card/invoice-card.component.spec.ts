import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceCardComponent } from './invoice-card.component';

describe('InvoiceCardComponent', () => {
  let component: InvoiceCardComponent;
  let fixture: ComponentFixture<InvoiceCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
