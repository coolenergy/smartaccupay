import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherExistsListingComponent } from './other-exists-listing.component';

describe('OtherExistsListingComponent', () => {
  let component: OtherExistsListingComponent;
  let fixture: ComponentFixture<OtherExistsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherExistsListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherExistsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
