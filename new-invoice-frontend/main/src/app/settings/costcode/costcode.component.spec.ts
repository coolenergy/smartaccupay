import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostcodeComponent } from './costcode.component';

describe('CostcodeComponent', () => {
  let component: CostcodeComponent;
  let fixture: ComponentFixture<CostcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostcodeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
