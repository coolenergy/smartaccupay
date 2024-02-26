import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInvoiceFormComponent } from './upload-invoice-form.component';

describe('UploadInvoiceFormComponent', () => {
  let component: UploadInvoiceFormComponent;
  let fixture: ComponentFixture<UploadInvoiceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadInvoiceFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadInvoiceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
