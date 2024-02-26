import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermspageComponent } from './termspage.component';

describe('TermspageComponent', () => {
  let component: TermspageComponent;
  let fixture: ComponentFixture<TermspageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TermspageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermspageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
