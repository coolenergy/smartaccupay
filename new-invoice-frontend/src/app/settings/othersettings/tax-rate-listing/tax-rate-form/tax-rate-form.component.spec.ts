import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxRateFormComponent } from './tax-rate-form.component';

describe('TaxRateFormComponent', () => {
  let component: TaxRateFormComponent;
  let fixture: ComponentFixture<TaxRateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxRateFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
