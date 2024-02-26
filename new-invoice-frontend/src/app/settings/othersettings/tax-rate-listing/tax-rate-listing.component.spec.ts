import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxRateListingComponent } from './tax-rate-listing.component';

describe('TaxRateListingComponent', () => {
  let component: TaxRateListingComponent;
  let fixture: ComponentFixture<TaxRateListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxRateListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxRateListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
