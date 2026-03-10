using AccessManagementSystem.Application.DTOs.Audit;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AccessManagementSystem.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AuditLogResponseDto>> GetAuditHistoryAsync(int requestId)
    {
        var logs = await _context.AuditLogs
            .Include(x => x.ChangedBy)
            .Where(x => x.RequestId == requestId)
            .OrderByDescending(x => x.CreatedDate)
            .ToListAsync();

        return logs.Select(x => new AuditLogResponseDto
        {
            Id = x.Id,
            RequestId = x.RequestId,
            Action = x.Action,
            OldStatus = x.OldStatus.ToString(),
            NewStatus = x.NewStatus.ToString(),
            ChangedByName = x.ChangedBy?.FullName ?? "",
            Remarks = x.Remarks,
            CreatedDate = x.CreatedDate
        }).ToList();
    }
}