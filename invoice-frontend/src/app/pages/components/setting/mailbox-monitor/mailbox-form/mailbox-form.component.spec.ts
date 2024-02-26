import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailboxFormComponent } from './mailbox-form.component';

describe('MailboxFormComponent', () => {
  let component: MailboxFormComponent;
  let fixture: ComponentFixture<MailboxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailboxFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailboxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
