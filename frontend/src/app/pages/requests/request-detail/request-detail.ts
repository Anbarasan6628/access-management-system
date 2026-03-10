import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RequestService } from '../../../core/services/request/request.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ChangeRequest } from '../../../core/models/request.model';
import { AuditLog } from '../../../core/models/audit.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.scss'
})
export class RequestDetail implements OnInit {
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private requestService = inject(RequestService);
  private authService    = inject(AuthService);

  request:     ChangeRequest | null = null;
  auditLogs:   AuditLog[] = [];
  isLoading    = true;
  actionLoading = false;
  errorMessage  = '';

  // Reject dialog
  showRejectDialog = false;
  rejectReason     = '';

  currentUser = this.authService.getCurrentUser();

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadRequest(id);
    this.loadAuditLogs(id);
  }

  loadRequest(id: number) {
    this.isLoading = true;
    this.requestService.getById(id).subscribe({
      next: (data) => {
        this.request   = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load request';
      }
    });
  }

  loadAuditLogs(id: number) {
    this.requestService.getAuditLogs(id).subscribe({
      next: (logs) => { this.auditLogs = logs; },
      error: () => {}
    });
  }

  // ── ACTIONS ───────────────────────────
  submit() {
    this.performAction(() =>
      this.requestService.submit(this.request!.id)
    );
  }

  startReview() {
    this.performAction(() =>
      this.requestService.startReview(this.request!.id)
    );
  }

  approve() {
    this.performAction(() =>
      this.requestService.approve(this.request!.id)
    );
  }

  openRejectDialog() {
    this.showRejectDialog = true;
    this.rejectReason     = '';
  }

  confirmReject() {
    if (!this.rejectReason.trim()) return;
    this.showRejectDialog = false;
    this.performAction(() =>
      this.requestService.reject(this.request!.id, this.rejectReason)
    );
  }

  sendBack() {
    this.performAction(() =>
      this.requestService.sendBack(this.request!.id)
    );
  }

  provision() {
    this.performAction(() =>
      this.requestService.provision(this.request!.id)
    );
  }

  close() {
    this.performAction(() =>
      this.requestService.close(this.request!.id)
    );
  }

  private performAction(action: () => any) {
    this.actionLoading = true;
    this.errorMessage  = '';
    action().subscribe({
      next: () => {
        this.actionLoading = false;
        this.loadRequest(this.request!.id);
        this.loadAuditLogs(this.request!.id);
      },
      error: (err: any) => {
        this.actionLoading = false;
        this.errorMessage  = err.error?.message || 'Action failed';
      }
    });
  }

  // ── HELPERS ───────────────────────────
  getStatusClass(status: string): string {
    const map: any = {
      'Draft': 'draft', 'Submitted': 'submitted',
      'InReview': 'inreview', 'Approved': 'approved',
      'Rejected': 'rejected', 'Provisioning': 'provisioning',
      'Closed': 'closed'
    };
    return map[status] ?? 'draft';
  }

  getPriorityClass(priority: string): string {
    const map: any = {
      'Low': 'low', 'Medium': 'medium',
      'High': 'high', 'Critical': 'critical'
    };
    return map[priority] ?? 'low';
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now  = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  }

  get isEmployee(): boolean { return this.authService.isEmployee(); }
  get isReviewer(): boolean { return this.authService.isReviewer(); }
  get isAdmin():    boolean { return this.authService.isAdmin(); }

  get canEdit(): boolean {
    return this.request?.status === 'Draft' &&
           this.request?.createdByName === this.currentUser?.fullName;
  }

  get canSubmit(): boolean {
    return this.request?.status === 'Draft' && this.isEmployee;
  }

  get canStartReview(): boolean {
    return this.request?.status === 'Submitted' &&
           (this.isReviewer || this.isAdmin);
  }

  get canApprove(): boolean {
    return this.request?.status === 'InReview' &&
           (this.isReviewer || this.isAdmin);
  }

  get canReject(): boolean {
    return this.request?.status === 'InReview' &&
           (this.isReviewer || this.isAdmin);
  }

  get canSendBack(): boolean {
    return this.request?.status === 'InReview' &&
           (this.isReviewer || this.isAdmin);
  }

  get canProvision(): boolean {
    return this.request?.status === 'Approved' && this.isAdmin;
  }

  get canClose(): boolean {
    return this.request?.status === 'Provisioning' && this.isAdmin;
  }
}