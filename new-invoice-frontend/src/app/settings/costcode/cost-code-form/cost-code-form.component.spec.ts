import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostCodeFormComponent } from './cost-code-form.component';

describe('CostCodeFormComponent', () => {
  let component: CostCodeFormComponent;
  let fixture: ComponentFixture<CostCodeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostCodeFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostCodeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
