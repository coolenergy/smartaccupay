import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsFormComponent } from './terms-form.component';

describe('TermsFormComponent', () => {
  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermsFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
