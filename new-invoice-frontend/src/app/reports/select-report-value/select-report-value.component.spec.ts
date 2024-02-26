import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectReportValueComponent } from './select-report-value.component';

describe('SelectReportValueComponent', () => {
  let component: SelectReportValueComponent;
  let fixture: ComponentFixture<SelectReportValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectReportValueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectReportValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
