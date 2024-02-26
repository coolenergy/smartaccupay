import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { LockedComponent } from './locked.component';
describe('LockedComponent', () => {
  let component: LockedComponent;
  let fixture: ComponentFixture<LockedComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LockedComponent]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(LockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
