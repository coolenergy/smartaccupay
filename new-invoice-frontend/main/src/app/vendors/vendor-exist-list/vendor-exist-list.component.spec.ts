import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorExistListComponent } from './vendor-exist-list.component';

describe('VendorExistListComponent', () => {
  let component: VendorExistListComponent;
  let fixture: ComponentFixture<VendorExistListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorExistListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorExistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
