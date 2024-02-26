import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserHistoryComponent } from './user-history.component';

describe('UserHistoryComponent', () => {
  let component: UserHistoryComponent;
  let fixture: ComponentFixture<UserHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
