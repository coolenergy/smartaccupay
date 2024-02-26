import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDocumentFormComponent } from './user-document-form.component';

describe('UserDocumentFormComponent', () => {
  let component: UserDocumentFormComponent;
  let fixture: ComponentFixture<UserDocumentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDocumentFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDocumentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
