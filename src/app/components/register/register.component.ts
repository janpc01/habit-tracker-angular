import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule, 
        ReactiveFormsModule, 
        RouterLink
    ],
    providers: [],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        password_confirmation: ['', Validators.required]
      },
      { validator: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const password_confirmation = form.get('password_confirmation')?.value;
    return password === password_confirmation ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.error = error.error.message || 'Registration failed';
        }
      });
    }
  }
}