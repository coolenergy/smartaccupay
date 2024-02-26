import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorTypeFormComponent } from './vendor-type-form.component';

describe('VendorTypeFormComponent', () => {
  let component: VendorTypeFormComponent;
  let fixture: ComponentFixture<VendorTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorTypeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
