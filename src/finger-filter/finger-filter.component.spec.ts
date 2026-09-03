import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FingerFilterComponent } from './finger-filter.component';

describe('FingerFilterComponent', () => {
  let component: FingerFilterComponent;
  let fixture: ComponentFixture<FingerFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FingerFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FingerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
