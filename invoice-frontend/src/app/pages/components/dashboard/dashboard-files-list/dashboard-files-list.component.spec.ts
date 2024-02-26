import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFilesListComponent } from './dashboard-files-list.component';

describe('DashboardFilesListComponent', () => {
  let component: DashboardFilesListComponent;
  let fixture: ComponentFixture<DashboardFilesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardFilesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardFilesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
