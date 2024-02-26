import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyHistoryComponent } from './monthly-history.component';

describe('MonthlyHistoryComponent', () => {
  let component: MonthlyHistoryComponent;
  let fixture: ComponentFixture<MonthlyHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
