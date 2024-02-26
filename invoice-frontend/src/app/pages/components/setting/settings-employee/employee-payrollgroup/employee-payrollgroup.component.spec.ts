import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePayrollgroupComponent } from './employee-payrollgroup.component';

describe('EmployeePayrollgroupComponent', () => {
  let component: EmployeePayrollgroupComponent;
  let fixture: ComponentFixture<EmployeePayrollgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeePayrollgroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePayrollgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
