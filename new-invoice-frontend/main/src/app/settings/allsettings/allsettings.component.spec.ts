import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllsettingsComponent } from './allsettings.component';

describe('AllsettingsComponent', () => {
  let component: AllsettingsComponent;
  let fixture: ComponentFixture<AllsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllsettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
