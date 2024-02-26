import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustompdfviewerComponent } from './custompdfviewer.component';

describe('CustompdfviewerComponent', () => {
  let component: CustompdfviewerComponent;
  let fixture: ComponentFixture<CustompdfviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustompdfviewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustompdfviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
