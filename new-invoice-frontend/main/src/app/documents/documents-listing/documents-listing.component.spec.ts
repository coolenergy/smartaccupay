import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsListingComponent } from './documents-listing.component';

describe('DocumentsListingComponent', () => {
  let component: DocumentsListingComponent;
  let fixture: ComponentFixture<DocumentsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentsListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
