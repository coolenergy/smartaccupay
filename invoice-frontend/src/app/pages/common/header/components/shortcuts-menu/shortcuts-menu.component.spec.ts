import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShortcutsMenuComponent } from './shortcuts-menu.component';

describe('ShortcutsMenuComponent', () => {
  let component: ShortcutsMenuComponent;
  let fixture: ComponentFixture<ShortcutsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShortcutsMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShortcutsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
