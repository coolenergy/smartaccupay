import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitsDataListComponent } from './exits-data-list.component';

describe('ExitsDataListComponent', () => {
  let component: ExitsDataListComponent;
  let fixture: ComponentFixture<ExitsDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExitsDataListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitsDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
