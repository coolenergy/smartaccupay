import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTitleListComponent } from './job-title-list.component';

describe('JobTitleListComponent', () => {
  let component: JobTitleListComponent;
  let fixture: ComponentFixture<JobTitleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTitleListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTitleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
