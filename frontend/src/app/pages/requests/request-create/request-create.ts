import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request/request.service';
import { UserService } from '../../../core/services/user/user.service';
import { User } from '../../../core/models/user.model';
import { Dropdown, DropdownOption } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    Dropdown
  ],
  templateUrl: './request-create.html',
  styleUrl: './request-create.scss'
})
export class RequestCreate implements OnInit {
  private fb             = inject(FormBuilder);
  private requestService = inject(RequestService);
  private userService    = inject(UserService);
  private router         = inject(Router);

  form: FormGroup = this.fb.group({
    title:              ['', [Validators.required, Validators.minLength(5)]],
    description:        ['', [Validators.required, Validators.minLength(10)]],
    category:           ['', Validators.required],
    priority:           ['', Validators.required],
    assignedReviewerId: ['', Validators.required],
  });

  reviewers:      User[]           = [];
  reviewerOptions: DropdownOption[] = [];
  selectedFile:   File | null      = null;
  fileName        = '';
  isLoading       = false;
  isLoadingUsers  = true;
  errorMessage    = '';
  successMessage  = '';

  // ← values must be STRING for DropdownOption
  categories: DropdownOption[] = [
    { value: '0', label: 'Access Change' },
    { value: '1', label: 'Deployment' },
    { value: '2', label: 'Configuration' },
    { value: '3', label: 'Other' },
  ];

  priorities: DropdownOption[] = [
    { value: '0', label: 'Low' },
    { value: '1', label: 'Medium' },
    { value: '2', label: 'High' },
    { value: '3', label: 'Critical' },
  ];

  ngOnInit() { this.loadReviewers(); }

  loadReviewers() {
    this.isLoadingUsers = true;
    this.userService.getReviewers().subscribe({
      next: (users) => {
        this.reviewers      = users;
        this.reviewerOptions = users.map(u => ({
          value: String(u.id),
          label: `${u.fullName} — ${u.role}`
        }));
        this.isLoadingUsers = false;
      },
      error: (err) => {
        console.error('Error loading reviewers:', err);
        this.isLoadingUsers = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Only PDF, DOC, DOCX, PNG, JPG files allowed!';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'File size must be less than 5MB!';
      return;
    }

    this.selectedFile = file;
    this.fileName     = file.name;
    this.errorMessage = '';
  }

  removeFile() {
    this.selectedFile = null;
    this.fileName     = '';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    const dto = {
      ...this.form.value,
      attachment: this.selectedFile
    };

    this.requestService.create(dto).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.router.navigate(['/requests', created.id]);
      },
      error: (err) => {
        this.isLoading    = false;
        this.errorMessage = err.error?.message || 'Failed to create request';
      }
    });
  }

  get title()              { return this.form.get('title')!; }
  get description()        { return this.form.get('description')!; }
  get category()           { return this.form.get('category')!; }
  get priority()           { return this.form.get('priority')!; }
  get assignedReviewerId() { return this.form.get('assignedReviewerId')!; }
}