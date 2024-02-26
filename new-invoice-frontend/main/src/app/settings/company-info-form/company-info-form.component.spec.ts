import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInfoFormComponent } from './company-info-form.component';

describe('CompanyInfoFormComponent', () => {
  let component: CompanyInfoFormComponent;
  let fixture: ComponentFixture<CompanyInfoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyInfoFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyInfoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
