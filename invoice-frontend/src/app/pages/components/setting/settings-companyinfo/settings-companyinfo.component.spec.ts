import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsCompanyinfoComponent } from './settings-companyinfo.component';

describe('SettingsCompanyinfoComponent', () => {
  let component: SettingsCompanyinfoComponent;
  let fixture: ComponentFixture<SettingsCompanyinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingsCompanyinfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsCompanyinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
