import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentTypeFormComponent } from './document-type-form.component';

describe('DocumentTypeFormComponent', () => {
  let component: DocumentTypeFormComponent;
  let fixture: ComponentFixture<DocumentTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentTypeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
