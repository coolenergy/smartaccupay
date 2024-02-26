import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLanguageComponent } from './employee-language.component';

describe('EmployeeLanguageComponent', () => {
  let component: EmployeeLanguageComponent;
  let fixture: ComponentFixture<EmployeeLanguageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeLanguageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
