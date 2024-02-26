import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRestoreFormComponent } from './user-restore-form.component';

describe('UserRestoreFormComponent', () => {
  let component: UserRestoreFormComponent;
  let fixture: ComponentFixture<UserRestoreFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRestoreFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRestoreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
