export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}

export interface CurrentUser {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  role: 'Employee' | 'Reviewer' | 'Admin';
}