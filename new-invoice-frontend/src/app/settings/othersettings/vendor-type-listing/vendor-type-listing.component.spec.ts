import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorTypeListingComponent } from './vendor-type-listing.component';

describe('VendorTypeListingComponent', () => {
  let component: VendorTypeListingComponent;
  let fixture: ComponentFixture<VendorTypeListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorTypeListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorTypeListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
