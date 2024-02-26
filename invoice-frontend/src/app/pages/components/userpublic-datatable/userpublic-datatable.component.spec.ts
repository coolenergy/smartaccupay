import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserpublicDatatableComponent } from './userpublic-datatable.component';

describe('UserpublicDatatableComponent', () => {
  let component: UserpublicDatatableComponent;
  let fixture: ComponentFixture<UserpublicDatatableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserpublicDatatableComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserpublicDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
