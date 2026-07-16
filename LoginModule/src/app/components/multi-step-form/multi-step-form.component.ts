import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { MatStepper, MatStep, MatStepLabel, MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { HasUnsavedChanges } from 'src/app/guard/unsaved-changes.guard';

export interface StepType {
  label: string;
  fields: FormlyFieldConfig[];
}

@Component({
  selector: 'app-multi-step-form',
  templateUrl: './multi-step-form.component.html',
  styleUrls: ['./multi-step-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ReactiveFormsModule, MatStepper, MatStep, MatStepLabel, FormlyModule, MatButton, MatStepperPrevious, MatStepperNext]
})
export class MultiStepFormComponent implements HasUnsavedChanges {
  private fb = inject(FormBuilder);

  isLinear = true;
  multiStepForms!: FormGroup;
  steps!: Array<{
    label: string;
    fields: FormlyFieldConfig[];
    controlName: string;
  }>;

  hasUnsavedChanges(): boolean {
    return !!this.multiStepForms?.dirty;
  }

  ngOnInit() {
    this.multiStepForms = this.fb.group({
      basic: this.fb.group({
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
      }),
      contact: this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        fax: ['', Validators.required],
      }),
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        pin: ['', Validators.required],
      }),
    });

    this.steps = [
      {
        label: 'Basic Info',
        fields: [
          {
            key: 'firstname',
            type: 'input',
            templateOptions: {
              label: 'First Name',
              placeholder: 'First name',
              required: true,
            },
          },
          {
            key: 'lastname',
            type: 'input',
            templateOptions: {
              label: 'Last Name',
              placeholder: 'Last name',
              required: true,
            },
          },
        ],
        controlName: 'basic',
      },
      {
        label: 'Contact Info',
        fields: [
          {
            key: 'email',
            type: 'input',
            templateOptions: {
              label: 'Email',
              placeholder: 'Email',
              required: true,
              type: 'email',
            },
          },
          {
            key: 'phone',
            type: 'input',
            templateOptions: {
              label: 'Phone',
              placeholder: 'Phone',
              required: true,
            },
          },
          {
            key: 'fax',
            type: 'input',
            templateOptions: {
              label: 'Fax',
              placeholder: 'Fax',
              required: true,
            },
          },
        ],
        controlName: 'contact',
      },
      {
        label: 'Address',
        fields: [
          {
            key: 'street',
            type: 'input',
            templateOptions: {
              label: 'Street',
              placeholder: 'Street',
              required: true,
            },
          },
          {
            key: 'city',
            type: 'input',
            templateOptions: {
              label: 'City',
              placeholder: 'City',
              required: true,
            },
          },
          {
            key: 'pin',
            type: 'input',
            templateOptions: {
              label: 'PIN',
              placeholder: 'Pin',
              required: true,
            },
          },
        ],
        controlName: 'address',
      },
    ];
  }

  getFormGroup(controlName: string): FormGroup | null {
    const control = this.multiStepForms.get(controlName);
    return control instanceof FormGroup ? control : null;
  }
  submit() {
    if (this.multiStepForms.valid) {
      console.log(this.multiStepForms.value);
      // handle submission
    }
  }

  //Scroll error
  // myForm!: FormGroup;

  // @ViewChild('username', { static: false }) usernameField!: ElementRef;
  // @ViewChild('email', { static: false }) emailField!: ElementRef;

  // constructor(private fb: FormBuilder) {
  //   this.myForm = this.fb.group({
  //     username: ['', Validators.required],
  //     email: ['', [Validators.required, Validators.email]]
  //   });
  // }

  // onSubmit() {
  //   if (this.myForm.invalid) {
  //     this.markAllAsTouchedAndFocus();
  //     return;
  //   }
  //   // Submit logic here
  // }

  // private markAllAsTouchedAndFocus() {
  //   const controls = this.myForm.controls;
  //   for (const name in controls) {
  //     if (controls[name].invalid) {
  //       controls[name].markAsTouched();
  //       this.scrollToField(name);
  //       break;
  //     }
  //   }
  // }

  // private scrollToField(fieldName: string) {
  //   if (fieldName === 'username') {
  //     this.usernameField.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     this.usernameField.nativeElement.focus();
  //   } else if (fieldName === 'email') {
  //     this.emailField.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     this.emailField.nativeElement.focus();
  //   }
  // }
}
