import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardInvoiceListComponent } from './dashboard-invoice-list.component';

describe('DashboardInvoiceListComponent', () => {
  let component: DashboardInvoiceListComponent;
  let fixture: ComponentFixture<DashboardInvoiceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardInvoiceListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardInvoiceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
