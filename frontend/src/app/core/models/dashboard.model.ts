export interface DashboardStats {
  totalRequests: number;
  draftCount: number;
  submittedCount: number;
  inReviewCount: number;
  approvedCount: number;
  rejectedCount: number;
  provisioningCount: number;
  closedCount: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  requestId: number;
  title: string;
  action: string;
  changedByName: string;
  date: string;
}