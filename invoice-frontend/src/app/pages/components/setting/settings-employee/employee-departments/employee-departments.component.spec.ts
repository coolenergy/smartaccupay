import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDepartmentsComponent } from './employee-departments.component';

describe('EmployeeDepartmentsComponent', () => {
  let component: EmployeeDepartmentsComponent;
  let fixture: ComponentFixture<EmployeeDepartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDepartmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDepartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
