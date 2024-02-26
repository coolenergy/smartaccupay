import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeCustomepdfviewerComponent } from './iframe-customepdfviewer.component';

describe('IframeCustomepdfviewerComponent', () => {
  let component: IframeCustomepdfviewerComponent;
  let fixture: ComponentFixture<IframeCustomepdfviewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeCustomepdfviewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeCustomepdfviewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
