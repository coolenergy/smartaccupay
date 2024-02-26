import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportOtherSettingsComponent } from './import-other-settings.component';

describe('ImportOtherSettingsComponent', () => {
  let component: ImportOtherSettingsComponent;
  let fixture: ComponentFixture<ImportOtherSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportOtherSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportOtherSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
