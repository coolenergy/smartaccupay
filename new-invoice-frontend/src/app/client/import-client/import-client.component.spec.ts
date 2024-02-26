import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportClientComponent } from './import-client.component';

describe('ImportClientComponent', () => {
  let component: ImportClientComponent;
  let fixture: ComponentFixture<ImportClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportClientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
