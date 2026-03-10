import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardService } from '../../core/services/dashboard/dashboard.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private authService      = inject(AuthService);

  stats: DashboardStats | null = null;
  isLoading = true;
  currentUser = this.authService.getCurrentUser();

  statCards = [
    { label: 'Total Requests',  key: 'totalRequests',    icon: 'assignment',      color: '#4682B4' },
    { label: 'In Review',       key: 'inReviewCount',    icon: 'rate_review',     color: '#F39C12' },
    { label: 'Approved',        key: 'approvedCount',    icon: 'check_circle',    color: '#27AE60' },
    { label: 'Rejected',        key: 'rejectedCount',    icon: 'cancel',          color: '#E74C3C' },
    { label: 'Draft',           key: 'draftCount',       icon: 'edit_note',       color: '#95A5A6' },
    { label: 'Submitted',       key: 'submittedCount',   icon: 'send',            color: '#3498DB' },
    { label: 'Provisioning',    key: 'provisioningCount',icon: 'settings',        color: '#9B59B6' },
    { label: 'Closed',          key: 'closedCount',      icon: 'lock',            color: '#2C3E50' },
  ];

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats    = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getStatValue(key: string): number {
    if (!this.stats) return 0;
    return (this.stats as any)[key] ?? 0;
  }

  getStatusClass(status: string): string {
    const map: any = {
      'Submitted':    'submitted',
      'InReview':     'inreview',
      'Approved':     'approved',
      'Rejected':     'rejected',
      'Provisioning': 'provisioning',
      'Closed':       'closed',
      'Draft':        'draft',
    };
    return map[status] ?? 'draft';
  }

  getTimeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const normalized = dateStr.endsWith('Z') ? dateStr : dateStr + 'Z';
  const date = new Date(normalized);
  const now  = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 0)      return 'just now';
  if (diff < 60)     return `${diff}s ago`;
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
}