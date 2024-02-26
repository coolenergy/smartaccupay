import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersettingsComponent } from './othersettings.component';

describe('OthersettingsComponent', () => {
  let component: OthersettingsComponent;
  let fixture: ComponentFixture<OthersettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OthersettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
