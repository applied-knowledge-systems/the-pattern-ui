import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NurseViewComponent } from './nurse-view.component';

describe('NurseViewComponent', () => {
  let component: NurseViewComponent;
  let fixture: ComponentFixture<NurseViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NurseViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NurseViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
