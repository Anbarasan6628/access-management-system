import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RequestService } from '../../../core/services/request/request.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChangeRequest, PagedResult } from '../../../core/models/request.model';
import { Dropdown } from '../../../shared/components/dropdown/dropdown';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    Dropdown,
  ],
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss'
})
export class RequestList implements OnInit {
  private requestService = inject(RequestService);
  private authService    = inject(AuthService);

  result: PagedResult<ChangeRequest> | null = null;
  isLoading = true;
  currentUser = this.authService.getCurrentUser();

  // Filters
  searchText   = '';
  filterStatus   = '';
  filterPriority = '';
  filterCategory = '';

  // Pagination
  pageNumber = 1;
  pageSize   = 10;

  statusOptions = [
    { value: '',             label: 'All Status' },
    { value: 'Draft',        label: 'Draft' },
    { value: 'Submitted',    label: 'Submitted' },
    { value: 'InReview',     label: 'In Review' },
    { value: 'Approved',     label: 'Approved' },
    { value: 'Rejected',     label: 'Rejected' },
    { value: 'Provisioning', label: 'Provisioning' },
    { value: 'Closed',       label: 'Closed' },
  ];

  priorityOptions = [
    { value: '',         label: 'All Priority' },
    { value: 'Low',      label: 'Low' },
    { value: 'Medium',   label: 'Medium' },
    { value: 'High',     label: 'High' },
    { value: 'Critical', label: 'Critical' },
  ];

  categoryOptions = [
    { value: '',              label: 'All Category' },
    { value: 'AccessChange',  label: 'Access Change' },
    { value: 'Deployment',    label: 'Deployment' },
    { value: 'Configuration', label: 'Configuration' },
    { value: 'Other',         label: 'Other' },
  ];

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.isLoading = true;
    this.requestService.getAll(this.pageNumber, this.pageSize).subscribe({
      next: (data) => {
        this.result    = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredItems(): ChangeRequest[] {
    if (!this.result) return [];
    return this.result.items.filter(item => {
      const matchSearch   = !this.searchText ||
        item.title.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus   = !this.filterStatus   || item.status   === this.filterStatus;
      const matchPriority = !this.filterPriority || item.priority === this.filterPriority;
      const matchCategory = !this.filterCategory || item.category === this.filterCategory;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }

  onPageChange(page: number) {
    this.pageNumber = page;
    this.loadRequests();
  }

  get pages(): number[] {
    if (!this.result) return [];
    return Array.from({ length: this.result.totalPages }, (_, i) => i + 1);
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Draft':        'draft',
      'Submitted':    'submitted',
      'InReview':     'inreview',
      'Approved':     'approved',
      'Rejected':     'rejected',
      'Provisioning': 'provisioning',
      'Closed':       'closed',
    };
    return map[status] ?? 'draft';
  }

  getPriorityClass(priority: string): string {
    const map: any = {
      'Low':      'low',
      'Medium':   'medium',
      'High':     'high',
      'Critical': 'critical',
    };
    return map[priority] ?? 'low';
  }

  getPriorityIcon(priority: string): string {
    const map: any = {
      'Low':      'arrow_downward',
      'Medium':   'remove',
      'High':     'arrow_upward',
      'Critical': 'priority_high',
    };
    return map[priority] ?? 'remove';
  }

  canEdit(request: ChangeRequest): boolean {
    return request.status === 'Draft' &&
           request.createdByName === this.currentUser?.fullName;
  }

  isAdmin():    boolean { return this.authService.isAdmin(); }
  isReviewer(): boolean { return this.authService.isReviewer(); }
}