import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportVendorComponent } from './import-vendor.component';

describe('ImportVendorComponent', () => {
  let component: ImportVendorComponent;
  let fixture: ComponentFixture<ImportVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportVendorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
