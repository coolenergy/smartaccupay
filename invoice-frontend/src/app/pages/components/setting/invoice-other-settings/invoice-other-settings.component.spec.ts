import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceOtherSettingsComponent } from './invoice-other-settings.component';

describe('InvoiceOtherSettingsComponent', () => {
  let component: InvoiceOtherSettingsComponent;
  let fixture: ComponentFixture<InvoiceOtherSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceOtherSettingsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceOtherSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
