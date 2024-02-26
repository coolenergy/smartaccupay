import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailboxMonitorComponent } from './mailbox-monitor.component';

describe('MailboxMonitorComponent', () => {
  let component: MailboxMonitorComponent;
  let fixture: ComponentFixture<MailboxMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MailboxMonitorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MailboxMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
