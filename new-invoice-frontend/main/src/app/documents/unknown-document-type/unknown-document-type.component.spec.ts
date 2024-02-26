import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnknownDocumentTypeComponent } from './unknown-document-type.component';

describe('UnknownDocumentTypeComponent', () => {
  let component: UnknownDocumentTypeComponent;
  let fixture: ComponentFixture<UnknownDocumentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnknownDocumentTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnknownDocumentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
