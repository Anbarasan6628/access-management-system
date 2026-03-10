using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Application.DTOs.Audit;

namespace AccessManagementSystem.Application.Interfaces;

public interface IAuditService
{
    Task<List<AuditLogResponseDto>> GetAuditHistoryAsync(int requestId);
}
