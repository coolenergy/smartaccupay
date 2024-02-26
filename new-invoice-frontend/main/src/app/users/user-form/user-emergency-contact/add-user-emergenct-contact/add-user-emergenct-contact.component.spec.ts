import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserEmergenctContactComponent } from './add-user-emergenct-contact.component';

describe('AddUserEmergenctContactComponent', () => {
  let component: AddUserEmergenctContactComponent;
  let fixture: ComponentFixture<AddUserEmergenctContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUserEmergenctContactComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUserEmergenctContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
