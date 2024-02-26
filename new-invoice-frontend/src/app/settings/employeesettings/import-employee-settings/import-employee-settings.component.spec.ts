import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportEmployeeSettingsComponent } from './import-employee-settings.component';

describe('ImportEmployeeSettingsComponent', () => {
  let component: ImportEmployeeSettingsComponent;
  let fixture: ComponentFixture<ImportEmployeeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportEmployeeSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportEmployeeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
