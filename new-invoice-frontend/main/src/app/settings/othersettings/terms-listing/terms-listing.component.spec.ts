import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsListingComponent } from './terms-listing.component';

describe('TermsListingComponent', () => {
  let component: TermsListingComponent;
  let fixture: ComponentFixture<TermsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
