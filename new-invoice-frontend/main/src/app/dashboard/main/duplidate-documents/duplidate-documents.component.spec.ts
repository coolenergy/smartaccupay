import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplidateDocumentsComponent } from './duplidate-documents.component';

describe('DuplidateDocumentsComponent', () => {
  let component: DuplidateDocumentsComponent;
  let fixture: ComponentFixture<DuplidateDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplidateDocumentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplidateDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
