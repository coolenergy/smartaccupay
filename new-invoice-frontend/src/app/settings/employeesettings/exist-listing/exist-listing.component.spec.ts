import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistListingComponent } from './exist-listing.component';

describe('ExistListingComponent', () => {
  let component: ExistListingComponent;
  let fixture: ComponentFixture<ExistListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExistListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
