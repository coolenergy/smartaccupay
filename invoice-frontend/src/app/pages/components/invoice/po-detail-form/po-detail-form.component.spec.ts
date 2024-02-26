import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoDetailFormComponent } from './po-detail-form.component';

describe('PoDetailFormComponent', () => {
  let component: PoDetailFormComponent;
  let fixture: ComponentFixture<PoDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoDetailFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
