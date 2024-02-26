import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassNameListingComponent } from './class-name-listing.component';

describe('ClassNameListingComponent', () => {
  let component: ClassNameListingComponent;
  let fixture: ComponentFixture<ClassNameListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassNameListingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassNameListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
