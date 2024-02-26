import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickbooksAuthorizationComponent } from './quickbooks-authorization.component';

describe('QuickbooksAuthorizationComponent', () => {
  let component: QuickbooksAuthorizationComponent;
  let fixture: ComponentFixture<QuickbooksAuthorizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickbooksAuthorizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickbooksAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
