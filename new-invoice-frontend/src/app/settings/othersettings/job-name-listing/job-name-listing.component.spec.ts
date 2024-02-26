import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobNameListingComponent } from './job-name-listing.component';

describe('JobNameListingComponent', () => {
  let component: JobNameListingComponent;
  let fixture: ComponentFixture<JobNameListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobNameListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobNameListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
