import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsEmployeeComponent } from './settings-employee.component';

describe('SettingsEmployeeComponent', () => {
  let component: SettingsEmployeeComponent;
  let fixture: ComponentFixture<SettingsEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsEmployeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
