import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveTeamListComponent } from './archive-team-list.component';

describe('ArchiveTeamListComponent', () => {
  let component: ArchiveTeamListComponent;
  let fixture: ComponentFixture<ArchiveTeamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveTeamListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveTeamListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
