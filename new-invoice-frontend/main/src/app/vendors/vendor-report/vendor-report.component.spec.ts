import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorReportComponent } from './vendor-report.component';

describe('VendorReportComponent', () => {
  let component: VendorReportComponent;
  let fixture: ComponentFixture<VendorReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
