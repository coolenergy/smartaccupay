import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CostcodeExistListComponent } from './costcode-exist-list.component';

describe('CostcodeExistListComponent', () => {
  let component: CostcodeExistListComponent;
  let fixture: ComponentFixture<CostcodeExistListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CostcodeExistListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CostcodeExistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
