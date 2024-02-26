import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherExistListingComponent } from './other-exist-listing.component';

describe('OtherExistListingComponent', () => {
  let component: OtherExistListingComponent;
  let fixture: ComponentFixture<OtherExistListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherExistListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherExistListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
