import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcefullChangePasswordComponent } from './forcefull-change-password.component';

describe('ForcefullChangePasswordComponent', () => {
  let component: ForcefullChangePasswordComponent;
  let fixture: ComponentFixture<ForcefullChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForcefullChangePasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForcefullChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
