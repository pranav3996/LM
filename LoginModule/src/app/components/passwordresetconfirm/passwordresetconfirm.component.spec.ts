import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordresetconfirmComponent } from './passwordresetconfirm.component';

describe('PasswordresetconfirmComponent', () => {
  let component: PasswordresetconfirmComponent;
  let fixture: ComponentFixture<PasswordresetconfirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordresetconfirmComponent]
    });
    fixture = TestBed.createComponent(PasswordresetconfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
