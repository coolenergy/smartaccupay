import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserExistListComponent } from './user-exist-list.component';

describe('UserExistListComponent', () => {
  let component: UserExistListComponent;
  let fixture: ComponentFixture<UserExistListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserExistListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserExistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
