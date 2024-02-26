import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTypeFormComponent } from './job-type-form.component';

describe('JobTypeFormComponent', () => {
  let component: JobTypeFormComponent;
  let fixture: ComponentFixture<JobTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobTypeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
