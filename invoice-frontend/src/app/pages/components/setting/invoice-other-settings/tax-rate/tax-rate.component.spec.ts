import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxRateComponent } from './tax-rate.component';

describe('TaxRateComponent', () => {
  let component: TaxRateComponent;
  let fixture: ComponentFixture<TaxRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaxRateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
