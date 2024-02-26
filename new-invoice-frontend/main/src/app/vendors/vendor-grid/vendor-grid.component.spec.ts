import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorGridComponent } from './vendor-grid.component';

describe('VendorGridComponent', () => {
  let component: VendorGridComponent;
  let fixture: ComponentFixture<VendorGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
