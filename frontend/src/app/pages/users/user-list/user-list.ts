import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../../../core/services/user/user.service';
import { User } from '../../../core/models/user.model';
import { RoleCountPipe } from '../../../shared/pipes/role-count.pipe';
import { Dropdown, DropdownOption } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RoleCountPipe,
    Dropdown,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  private userService = inject(UserService);
  private fb          = inject(FormBuilder);

  users:          User[] = [];
  isLoading       = true;
  searchText      = '';
  filterRole      = '';
  errorMessage    = '';
  successMessage  = '';

  // Dialog state
  showDialog        = false;
  isEditMode        = false;
  isSaving          = false;
  editingId         = 0;
  showDeleteConfirm = false;
  deletingId        = 0;
  deletingName      = '';

  form: FormGroup = this.fb.group({
    employeeId: ['', Validators.required],
    fullName:   ['', Validators.required],
    email:      ['', [Validators.required, Validators.email]],
    password:   ['', Validators.required],
    role:       ['', Validators.required],
    department: ['', Validators.required],
  });

  // ── DROPDOWN OPTIONS ─────────────────────────────
  roleFilterOptions: DropdownOption[] = [
    { value: '',         label: 'All Roles' },
    { value: 'Admin',    label: 'Admin' },
    { value: 'Reviewer', label: 'Reviewer' },
    { value: 'Employee', label: 'Employee' },
  ];

  roles: DropdownOption[] = [
    { value: 'Employee', label: 'Employee' },
    { value: 'Reviewer', label: 'Reviewer' },
    { value: 'Admin',    label: 'Admin' },
  ];

  departmentOptions: DropdownOption[] = [
    { value: 'IT',          label: 'IT' },
    { value: 'HR',          label: 'HR' },
    { value: 'Finance',     label: 'Finance' },
    { value: 'Operations',  label: 'Operations' },
    { value: 'Marketing',   label: 'Marketing' },
    { value: 'Sales',       label: 'Sales' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Management',  label: 'Management' },
  ];

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (data) => { this.users = data; this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  get filteredUsers(): User[] {
    return this.users.filter(u => {
      const matchSearch = !this.searchText ||
        u.fullName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.employeeId.toLowerCase().includes(this.searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchText.toLowerCase());
      const matchRole = !this.filterRole || u.role === this.filterRole;
      return matchSearch && matchRole;
    });
  }

  openCreate() {
    this.isEditMode = false;
    this.editingId  = 0;
    this.form.reset();
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.errorMessage   = '';
    this.successMessage = '';
    this.showDialog     = true;
  }

  openEdit(user: User) {
    this.isEditMode = true;
    this.editingId  = user.id;
    this.form.patchValue({
      employeeId: user.employeeId,
      fullName:   user.fullName,
      email:      user.email,
      password:   '',
      role:       user.role,       // ← now string directly "Employee"/"Reviewer"/"Admin"
      department: user.department,
    });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.errorMessage   = '';
    this.successMessage = '';
    this.showDialog     = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.form.reset();
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving     = true;
    this.errorMessage = '';

    const val = this.form.value;

    if (this.isEditMode) {
      const updateDto = {
        fullName:   val.fullName,
        email:      val.email,
        role:       val.role,       // ← already string "Employee"/"Reviewer"/"Admin"
        department: val.department,
        ...(val.password ? { password: val.password } : {})
      };

      this.userService.update(this.editingId, updateDto).subscribe({
        next: () => {
          this.isSaving       = false;
          this.showDialog     = false;
          this.successMessage = 'User updated successfully!';
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.isSaving     = false;
          this.errorMessage = err.error?.message || 'Operation failed';
        }
      });

    } else {
      const createDto = {
        employeeId: val.employeeId,
        fullName:   val.fullName,
        email:      val.email,
        password:   val.password,
        role:       val.role,       // ← already string "Employee"/"Reviewer"/"Admin"
        department: val.department,
      };

      this.userService.create(createDto).subscribe({
        next: () => {
          this.isSaving       = false;
          this.showDialog     = false;
          this.successMessage = 'User created successfully!';
          this.loadUsers();
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.isSaving     = false;
          this.errorMessage = err.error?.message || 'Operation failed';
        }
      });
    }
  }

  openDeleteConfirm(user: User) {
    this.deletingId        = user.id;
    this.deletingName      = user.fullName;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    this.userService.delete(this.deletingId).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.successMessage    = 'User deleted successfully!';
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.showDeleteConfirm = false;
        this.errorMessage = err.error?.message || 'Delete failed';
      }
    });
  }

  getRoleClass(role: string): string {
    const map: any = {
      'Admin': 'admin', 'Reviewer': 'reviewer', 'Employee': 'employee'
    };
    return map[role] ?? 'employee';
  }

  get employeeId() { return this.form.get('employeeId')!; }
  get fullName()   { return this.form.get('fullName')!; }
  get email()      { return this.form.get('email')!; }
  get password()   { return this.form.get('password')!; }
  get role()       { return this.form.get('role')!; }
  get department() { return this.form.get('department')!; }
}