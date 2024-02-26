import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeJobtypeComponent } from './employee-jobtype.component';

describe('EmployeeJobtypeComponent', () => {
  let component: EmployeeJobtypeComponent;
  let fixture: ComponentFixture<EmployeeJobtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeJobtypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeJobtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
