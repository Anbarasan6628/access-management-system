import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { RequestService } from '../../../core/services/request/request.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChangeRequest } from '../../../core/models/request.model';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './review-list.html',
  styleUrl: './review-list.scss'
})
export class ReviewList implements OnInit {
  private requestService = inject(RequestService);
  private authService    = inject(AuthService);

  allRequests:  ChangeRequest[] = [];
  isLoading     = true;
  actionLoading: { [id: number]: boolean } = {};
  errorMessage  = '';
  successMessage = '';
  filterStatus  = 'all';
  searchText    = '';

  currentUser = this.authService.getCurrentUser();

  ngOnInit() { this.loadRequests(); }

  loadRequests() {
    this.isLoading = true;
    this.requestService.getAll(1, 100).subscribe({
      next: (data) => {
        this.allRequests = data.items.filter(r =>
          r.status === 'Submitted' || r.status === 'InReview'
        );
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get filteredRequests(): ChangeRequest[] {
    return this.allRequests.filter(r => {
      const matchStatus = this.filterStatus === 'all' ||
        r.status.toLowerCase() === this.filterStatus.toLowerCase();
      const matchSearch = !this.searchText ||
        r.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        r.createdByName.toLowerCase().includes(this.searchText.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  get submittedCount(): number {
    return this.allRequests.filter(r => r.status === 'Submitted').length;
  }

  get inReviewCount(): number {
    return this.allRequests.filter(r => r.status === 'InReview').length;
  }

  startReview(request: ChangeRequest) {
    this.actionLoading[request.id] = true;
    this.requestService.startReview(request.id).subscribe({
      next: () => {
        this.actionLoading[request.id] = false;
        this.successMessage = `Review started for "${request.title}"`;
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading[request.id] = false;
        this.errorMessage = err.error?.message || 'Action failed';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  approve(request: ChangeRequest) {
    this.actionLoading[request.id] = true;
    this.requestService.approve(request.id).subscribe({
      next: () => {
        this.actionLoading[request.id] = false;
        this.successMessage = `"${request.title}" approved!`;
        this.loadRequests();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.actionLoading[request.id] = false;
        this.errorMessage = err.error?.message || 'Action failed';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Submitted': 'submitted', 'InReview': 'inreview',
      'Approved': 'approved',   'Rejected': 'rejected',
    };
    return map[status] ?? 'submitted';
  }

  getPriorityClass(priority: string): string {
    const map: any = {
      'Low': 'low', 'Medium': 'medium',
      'High': 'high', 'Critical': 'critical'
    };
    return map[priority] ?? 'low';
  }

  getTimeAgo(dateStr: string): string {
    const diff = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / 1000
    );
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  isAdmin(): boolean { return this.authService.isAdmin(); }
}