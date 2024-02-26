import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCoreComponent } from './form-core.component';

describe('FormCoreComponent', () => {
  let component: FormCoreComponent;
  let fixture: ComponentFixture<FormCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
