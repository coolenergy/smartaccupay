import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QbdintegrationComponent } from './qbdintegration.component';

describe('QbdintegrationComponent', () => {
  let component: QbdintegrationComponent;
  let fixture: ComponentFixture<QbdintegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QbdintegrationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QbdintegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
