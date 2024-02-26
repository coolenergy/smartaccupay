import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QbointegrationComponent } from './qbointegration.component';

describe('QbointegrationComponent', () => {
  let component: QbointegrationComponent;
  let fixture: ComponentFixture<QbointegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QbointegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QbointegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
