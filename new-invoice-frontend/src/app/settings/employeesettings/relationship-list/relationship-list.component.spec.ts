import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipListComponent } from './relationship-list.component';

describe('RelationshipListComponent', () => {
  let component: RelationshipListComponent;
  let fixture: ComponentFixture<RelationshipListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationshipListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
