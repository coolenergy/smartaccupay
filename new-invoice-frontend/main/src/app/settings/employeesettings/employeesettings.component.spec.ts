import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesettingsComponent } from './employeesettings.component';

describe('EmployeesettingsComponent', () => {
  let component: EmployeesettingsComponent;
  let fixture: ComponentFixture<EmployeesettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
