import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomimageviewerComponent } from './customimageviewer.component';

describe('CustomimageviewerComponent', () => {
  let component: CustomimageviewerComponent;
  let fixture: ComponentFixture<CustomimageviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomimageviewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomimageviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
