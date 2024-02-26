import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingRoleComponent } from './setting-role.component';

describe('SettingRoleComponent', () => {
  let component: SettingRoleComponent;
  let fixture: ComponentFixture<SettingRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SettingRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
