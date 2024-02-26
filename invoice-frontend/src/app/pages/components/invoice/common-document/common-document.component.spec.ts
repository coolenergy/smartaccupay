import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDocumentComponent } from './common-document.component';

describe('CommonDocumentComponent', () => {
  let component: CommonDocumentComponent;
  let fixture: ComponentFixture<CommonDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonDocumentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
