import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobNameFormComponent } from './job-name-form.component';

describe('JobNameFormComponent', () => {
  let component: JobNameFormComponent;
  let fixture: ComponentFixture<JobNameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobNameFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobNameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
