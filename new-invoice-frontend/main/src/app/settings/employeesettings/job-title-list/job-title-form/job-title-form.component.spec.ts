import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTitleFormComponent } from './job-title-form.component';

describe('JobTitleFormComponent', () => {
  let component: JobTitleFormComponent;
  let fixture: ComponentFixture<JobTitleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTitleFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTitleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
