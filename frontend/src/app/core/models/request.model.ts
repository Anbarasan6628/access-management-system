export interface ChangeRequest {
  id:                   number;
  title:                string;
  description:          string;
  category:             string;
  priority:             string;
  status:               string;
  attachmentPath?:      string;
  attachmentUrl?:       string;
  assignedReviewerId:   number;    // ← ADD THIS
  assignedReviewerName: string;
  createdByName:        string;
  createdDate:          string;
  updatedDate:          string;
}

export interface CreateRequestDto {
  title: string;
  description: string;
  category: number;
  priority: number;
  assignedReviewerId: number;
  attachment?: File;
}

export interface UpdateRequestDto {
  title: string;
  description: string;
  category: number;
  priority: number;
  assignedReviewerId: number;
  attachment?: File;
}

export interface RejectRequestDto {
  reason: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}