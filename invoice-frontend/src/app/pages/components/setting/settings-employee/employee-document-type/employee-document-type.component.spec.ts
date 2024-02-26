import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDocumentTypeComponent } from './employee-document-type.component';

describe('EmployeeDocumentTypeComponent', () => {
  let component: EmployeeDocumentTypeComponent;
  let fixture: ComponentFixture<EmployeeDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeDocumentTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
