import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceProgressComponent } from './invoice-progress.component';

describe('InvoiceProgressComponent', () => {
  let component: InvoiceProgressComponent;
  let fixture: ComponentFixture<InvoiceProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceProgressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
