import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassNameFormComponent } from './class-name-form.component';

describe('ClassNameFormComponent', () => {
  let component: ClassNameFormComponent;
  let fixture: ComponentFixture<ClassNameFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassNameFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassNameFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
