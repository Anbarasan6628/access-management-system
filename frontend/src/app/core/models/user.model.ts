export interface User {
  id: number;
  employeeId: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  createdDate: string;
}

export interface CreateUserDto {
  employeeId: string;
  fullName:   string;
  email:      string;
  password:   string;
  role:       string;   // ← back to string
  department: string;
}

export interface UpdateUserDto {
  fullName:   string;
  email:      string;
  password?:  string;
  role:       string;   // ← back to string
  department: string;
}