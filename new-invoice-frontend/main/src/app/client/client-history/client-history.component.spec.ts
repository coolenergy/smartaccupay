import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientHistoryComponent } from './client-history.component';

describe('ClientHistoryComponent', () => {
  let component: ClientHistoryComponent;
  let fixture: ComponentFixture<ClientHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
