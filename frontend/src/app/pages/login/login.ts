import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private router      = inject(Router);
  private route       = inject(ActivatedRoute);

  loginForm: FormGroup = this.fb.group({
    employeeId: ['', [Validators.required]],
    password:   ['', [Validators.required, Validators.minLength(6)]]
  });

  hidePassword   = true;
  isLoading      = false;
  errorMessage   = '';
  sessionMessage = '';
  sessionIcon    = 'info';

  ngOnInit(): void {
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'timeout') {
      this.sessionMessage = 'Request timed out. Please check your connection and try again.';
      this.sessionIcon    = 'timer_off';
    } else if (reason === 'session') {
      this.sessionMessage = 'Your session has expired. Please sign in again.';
      this.sessionIcon    = 'lock_clock';
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading      = true;
    this.errorMessage   = '';
    this.sessionMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Invalid Employee ID or Password';
      }
    });
  }

  get employeeId() { return this.loginForm.get('employeeId')!; }
  get password()   { return this.loginForm.get('password')!; }
}