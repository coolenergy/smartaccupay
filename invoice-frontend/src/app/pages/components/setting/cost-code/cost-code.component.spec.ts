import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCodeComponent } from './cost-code.component';

describe('CostCodeComponent', () => {
  let component: CostCodeComponent;
  let fixture: ComponentFixture<CostCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CostCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
