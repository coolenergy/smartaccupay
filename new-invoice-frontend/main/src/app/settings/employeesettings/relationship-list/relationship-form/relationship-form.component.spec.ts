import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelationshipFormComponent } from './relationship-form.component';

describe('RelationshipFormComponent', () => {
  let component: RelationshipFormComponent;
  let fixture: ComponentFixture<RelationshipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RelationshipFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelationshipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
