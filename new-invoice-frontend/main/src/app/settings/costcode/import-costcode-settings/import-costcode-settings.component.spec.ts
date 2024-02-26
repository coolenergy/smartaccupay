import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCostcodeSettingsComponent } from './import-costcode-settings.component';

describe('ImportCostcodeSettingsComponent', () => {
  let component: ImportCostcodeSettingsComponent;
  let fixture: ComponentFixture<ImportCostcodeSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportCostcodeSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportCostcodeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
