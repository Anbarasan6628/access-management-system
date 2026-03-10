import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request/request.service';
import { UserService } from '../../../core/services/user/user.service';
import { User } from '../../../core/models/user.model';
import { Dropdown, DropdownOption } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-request-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Dropdown,
  ],
  templateUrl: './request-edit.html',
  styleUrl: './request-edit.scss'
})
export class RequestEdit implements OnInit {
  private fb             = inject(FormBuilder);
  private requestService = inject(RequestService);
  private userService    = inject(UserService);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);

  requestId    = 0;
  isLoading    = true;
  isSaving     = false;
  errorMessage  = '';
  reviewers:       User[]           = [];
  reviewerOptions: DropdownOption[] = [];
  selectedFile:    File | null      = null;
  fileName      = '';
  existingFile  = '';

  form: FormGroup = this.fb.group({
    title:              ['', [Validators.required, Validators.minLength(5)]],
    description:        ['', [Validators.required, Validators.minLength(10)]],
    category:           ['', Validators.required],
    priority:           ['', Validators.required],
    assignedReviewerId: ['', Validators.required],
  });

  // ← values must be STRING for Dropdown
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

  // ← maps string back to number for patchValue
  categoryMap: any = {
    'AccessChange': '0', 'Deployment': '1',
    'Configuration': '2', 'Other': '3'
  };

  priorityMap: any = {
    'Low': '0', 'Medium': '1',
    'High': '2', 'Critical': '3'
  };

  ngOnInit() {
    this.requestId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReviewers();
    this.loadRequest();
  }

  loadRequest() {
    this.requestService.getById(this.requestId).subscribe({
      next: (req) => {
        if (req.status !== 'Draft') {
          this.router.navigate(['/requests', this.requestId]);
          return;
        }
        this.form.patchValue({
          title:       req.title,
          description: req.description,
          category:    this.categoryMap[req.category] ?? '0',
          priority:    this.priorityMap[req.priority] ?? '0',
          assignedReviewerId: req.assignedReviewerId
            ? String(req.assignedReviewerId) : '',
        });
        if (req.attachmentPath) {
          this.existingFile = req.attachmentPath;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading    = false;
        this.errorMessage = 'Failed to load request';
      }
    });
  }

  loadReviewers() {
    this.userService.getReviewers().subscribe({
      next: (users) => {
        this.reviewers       = users;
        this.reviewerOptions = users.map(u => ({
          value: String(u.id),
          label: `${u.fullName} — ${u.role}`
        }));
      },
      error: () => {}
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const allowed = [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png', 'image/jpeg'
    ];

    if (!allowed.includes(file.type)) {
      this.errorMessage = 'Only PDF, DOC, DOCX, PNG, JPG allowed!';
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

    this.isSaving     = true;
    this.errorMessage = '';

    const dto = {
      ...this.form.value,
      attachment: this.selectedFile
    };

    this.requestService.update(this.requestId, dto).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/requests', this.requestId]);
      },
      error: (err) => {
        this.isSaving     = false;
        this.errorMessage = err.error?.message || 'Failed to update request';
      }
    });
  }

  get title()              { return this.form.get('title')!; }
  get description()        { return this.form.get('description')!; }
  get category()           { return this.form.get('category')!; }
  get priority()           { return this.form.get('priority')!; }
  get assignedReviewerId() { return this.form.get('assignedReviewerId')!; }
}