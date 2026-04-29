# 🔐 Access Management System

![.NET 8](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)
![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC2927?style=for-the-badge&logo=microsoftsqlserver)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens)
![Azure](https://img.shields.io/badge/Azure-Certified-0078D4?style=for-the-badge&logo=microsoftazure)

> An enterprise-grade Change Request Workflow application with role-based access control,
> structured approval workflows, and a complete audit trail.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [API Endpoints](#api-endpoints)
- [Role Based Access](#role-based-access)
- [Request Workflow](#request-workflow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Author](#author)

---

## 📖 Overview

The **Access Management System (AMS)** is a full-stack enterprise application
that manages IT change requests through a structured multi-role approval workflow.

Employees raise change requests, Reviewers review and approve or reject them,
and Admins manage users, provision approved requests, and close completed ones.
Every action is logged in a full audit trail with timestamps.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 21)                 │
│  Standalone Components │ Reactive Forms │ HTTP Interceptor│
│  Route Guards │ Custom Dropdown │ RxJS │ Angular Material │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS + JWT Bearer Token
┌──────────────────────▼──────────────────────────────────┐
│                  BACKEND (.NET 8 API)                    │
│                                                          │
│  ┌──────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Domain  │  │ Application │  │  Infrastructure  │   │
│  │ Entities │→ │ Interfaces  │→ │ EF Core Services │   │
│  │  Enums   │  │    DTOs     │  │  File Storage    │   │
│  └──────────┘  └─────────────┘  └──────────────────┘   │
│                                                          │
│  JWT Auth │ BCrypt │ CORS │ Exception Middleware         │
└──────────────────────┬──────────────────────────────────┘
                       │ EF Core (Code First)
┌──────────────────────▼──────────────────────────────────┐
│                  DATABASE (SQL Server)                   │
│         Users │ ChangeRequests │ AuditLogs               │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔐 Authentication & Security
- JWT Bearer token authentication with auto-expiry
- BCrypt password hashing — no plain text passwords
- Auto logout on token expiry or 401 response
- 30-second API timeout with redirect to login
- Role-based route guards (Employee / Reviewer / Admin)

### 📋 Change Request Management
- Create, edit, submit change requests (Employee)
- Assign reviewer while creating request
- File attachment support (PDF, DOC, PNG, JPG — max 5MB)
- Paginated request list with search and filters
- Real-time status badges with color coding

### ✅ Approval Workflow
- Multi-stage approval: Submit → Review → Approve → Provision → Close
- Reject with mandatory reason
- Send Back to Draft for revision
- Role-restricted actions per workflow stage

### 📊 Dashboard & Analytics
- Summary cards (Total, Pending, Approved, Rejected)
- Recent activity feed with time-ago display
- Role-specific statistics

### 🕵️ Audit Trail
- Every status transition is logged
- Shows: who acted, old status → new status, time ago
- Full timeline view on request detail page

### 👥 User Management (Admin)
- Create, edit, delete users
- Assign roles (Employee / Reviewer / Admin)
- Set department and employee ID

### 🎨 UI/UX
- Responsive design (desktop + mobile)
- Collapsible sidebar navigation
- Custom dropdown component (ControlValueAccessor)
- Angular Material + custom SCSS design system
- CSS variables for consistent theming

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| .NET 8 Web API | REST API framework |
| Clean Architecture | 4-layer separation (Domain/Application/Infrastructure/API) |
| Entity Framework Core | Code First ORM, migrations |
| SQL Server | Relational database |
| JWT Bearer Auth | Stateless authentication |
| BCrypt.Net | Password hashing |
| Swagger / OpenAPI | API documentation |

### Frontend
| Technology | Purpose |
|---|---|
| Angular 21 | Standalone component framework |
| Angular Material | UI component library |
| RxJS | Reactive programming (Observables, BehaviorSubject) |
| Reactive Forms | Form management and validation |
| HTTP Interceptor | JWT token injection + timeout + error handling |
| SCSS + CSS Variables | Design system and theming |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login and receive JWT token |

### Change Requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/requests` | All | Get paginated list of requests |
| GET | `/api/requests/{id}` | All | Get request by ID |
| POST | `/api/requests` | Employee | Create new request (multipart/form-data) |
| PUT | `/api/requests/{id}` | Employee | Edit draft request |
| POST | `/api/requests/{id}/submit` | Employee | Submit for review |
| POST | `/api/requests/{id}/review` | Reviewer/Admin | Start review |
| POST | `/api/requests/{id}/approve` | Reviewer/Admin | Approve request |
| POST | `/api/requests/{id}/reject` | Reviewer/Admin | Reject with reason |
| POST | `/api/requests/{id}/sendback` | Reviewer/Admin | Send back to draft |
| POST | `/api/requests/{id}/provision` | Admin | Start provisioning |
| POST | `/api/requests/{id}/close` | Admin | Close request |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/reviewers` | All | Get reviewers for assignment |
| POST | `/api/users` | Admin | Create new user |
| PUT | `/api/users/{id}` | Admin | Update user |
| DELETE | `/api/users/{id}` | Admin | Soft delete user |

### Dashboard & Audit
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/dashboard/stats` | All | Get dashboard statistics |
| GET | `/api/audit/{requestId}` | All | Get audit timeline for request |

---

## 👤 Role Based Access

| Feature | Employee | Reviewer | Admin |
|---------|----------|----------|-------|
| Create Request | ✅ | ✅ | ✅ |
| Submit Request | ✅ (own) | ✅ | ✅ |
| Edit Request | ✅ (draft only) | ❌ | ✅ |
| Start Review | ❌ | ✅ | ✅ |
| Approve / Reject | ❌ | ✅ | ✅ |
| Send Back | ❌ | ✅ | ✅ |
| Provision | ❌ | ❌ | ✅ |
| Close Request | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ |
| View Audit Trail | ✅ | ✅ | ✅ |

---

## 🔄 Request Workflow

```
                    ┌─────────┐
                    │  DRAFT  │◄──────────────┐
                    └────┬────┘               │
                         │ Submit             │ Send Back
                    ┌────▼────────┐           │
                    │  SUBMITTED  │           │
                    └────┬────────┘           │
                         │ Start Review       │
                    ┌────▼────────┐           │
                    │  IN REVIEW  ├───────────┘
                    └────┬────────┘
              ┌──────────┼──────────┐
           Approve     Reject    Send Back
              │          │
    ┌─────────▼──┐  ┌────▼────────┐
    │  APPROVED  │  │  REJECTED   │
    └─────────┬──┘  └─────────────┘
              │ Provision
    ┌──────────▼────────┐
    │   PROVISIONING    │
    └──────────┬────────┘
               │ Close
          ┌────▼────┐
          │  CLOSED │
          └─────────┘
```

---

## 📁 Project Structure

```
access-management-system/
│
├── backend/                          # .NET 8 Clean Architecture
│   ├── AccessManagementSystem.Domain/
│   │   ├── Entities/                 # BaseEntity, User, ChangeRequest, AuditLog
│   │   └── Enums/                    # UserRole, RequestStatus, Priority, Category
│   ├── AccessManagementSystem.Application/
│   │   ├── Interfaces/               # IAuthService, IRequestService, etc.
│   │   └── DTOs/                     # Request/Response DTOs
│   ├── AccessManagementSystem.Infrastructure/
│   │   ├── Data/                     # AppDbContext, Migrations
│   │   └── Services/                 # AuthService, RequestService, etc.
│   └── AccessManagemntSystem.API/
│       ├── Controllers/              # Auth, Request, User, Dashboard, Audit
│       ├── Middleware/               # ExceptionMiddleware
│       └── Helpers/                  # UtcDateTimeConverter
│
└── frontend/                         # Angular 21
    └── src/app/
        ├── core/
        │   ├── guards/               # authGuard, roleGuard
        │   ├── interceptors/         # jwtInterceptor (token + timeout)
        │   ├── models/               # TypeScript interfaces
        │   └── services/             # Auth, Request, User, Dashboard
        ├── layout/
        │   ├── main-layout/          # App shell
        │   ├── navbar/               # Top navigation
        │   └── sidebar/              # Side navigation + user card
        ├── pages/
        │   ├── login/                # Login page (Inter font design)
        │   ├── dashboard/            # Stats + recent activity
        │   ├── requests/             # List, Create, Edit, Detail
        │   ├── review/               # Reviewer queue
        │   └── users/                # Admin user management
        └── shared/
            └── components/
                └── dropdown/         # Custom ControlValueAccessor dropdown
```

---

## 🚀 Getting Started

### Prerequisites
```
- .NET 8 SDK
- Node.js 18+
- SQL Server
- Angular CLI 21
```

### Backend Setup
```bash
cd backend/AccessManagemntSystem.API

# Update connection string in appsettings.json
# "Server=YOUR_SERVER;Database=AccessManagementDB;..."

# Run migrations
dotnet ef database update

# Start API
dotnet run
# API runs at: https://localhost:44363
# Swagger UI: https://localhost:44363/swagger
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
ng serve
# App runs at: http://localhost:4200
```

### Test Credentials
| Role | Employee ID | Password |
|------|-------------|----------|
| Admin | ADM001 | Anbu@123 |
| Reviewer | REV001 | Anbu@123 |
| Employee | EMP001 | Anbu@123 |

---

## 👨‍💻 Author

**Anbarasan S**
Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/anbarasan-s-bb6a89239)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/Anbarasan6628)

---

> 💡 *Built as a portfolio project to demonstrate enterprise full-stack development
> using .NET 8 Clean Architecture and Angular 21 with real-world patterns
> including JWT auth, role-based access, audit trails, and structured workflows.*
