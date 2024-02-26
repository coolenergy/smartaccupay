import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEmergencyContactComponent } from './user-emergency-contact.component';

describe('UserEmergencyContactComponent', () => {
  let component: UserEmergencyContactComponent;
  let fixture: ComponentFixture<UserEmergencyContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserEmergencyContactComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEmergencyContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
