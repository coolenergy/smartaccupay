import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobtitleComponent } from './employee-jobtitle.component';

describe('EmployeeJobtitleComponent', () => {
  let component: EmployeeJobtitleComponent;
  let fixture: ComponentFixture<EmployeeJobtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeJobtitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeJobtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
