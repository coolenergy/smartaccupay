import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyInvoiceComponent } from './monthly-invoice.component';

describe('MonthlyInvoiceComponent', () => {
  let component: MonthlyInvoiceComponent;
  let fixture: ComponentFixture<MonthlyInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyInvoiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
