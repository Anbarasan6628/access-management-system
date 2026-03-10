export interface AuditLog {
  id: number;
  requestId: number;
  action: string;
  oldStatus: string;
  newStatus: string;
  changedByName: string;
  remarks?: string;
  createdDate: string;
}