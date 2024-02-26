import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackingSlipFormComponent } from './packing-slip-form.component';

describe('PackingSlipFormComponent', () => {
  let component: PackingSlipFormComponent;
  let fixture: ComponentFixture<PackingSlipFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackingSlipFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackingSlipFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
