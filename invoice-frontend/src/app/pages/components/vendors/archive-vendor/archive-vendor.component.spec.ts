import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveVendorComponent } from './archive-vendor.component';

describe('ArchiveVendorComponent', () => {
  let component: ArchiveVendorComponent;
  let fixture: ComponentFixture<ArchiveVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveVendorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchiveVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
