import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeRelationshipComponent } from './employee-relationship.component';

describe('EmployeeRelationshipComponent', () => {
  let component: EmployeeRelationshipComponent;
  let fixture: ComponentFixture<EmployeeRelationshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeRelationshipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
