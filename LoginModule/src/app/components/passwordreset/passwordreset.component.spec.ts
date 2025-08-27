import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordresetComponent } from './passwordreset.component';

describe('PasswordresetComponent', () => {
  let component: PasswordresetComponent;
  let fixture: ComponentFixture<PasswordresetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PasswordresetComponent]
    });
    fixture = TestBed.createComponent(PasswordresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
