using AccessManagementSystem.Application.DTOs.Dashboard;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Domain.Enums;
using AccessManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AccessManagementSystem.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync(int userId, string role)
    {
        // Filter based on role
        var query = _context.ChangeRequests.AsQueryable();

        if (role == "Employee")
            query = query.Where(x => x.CreatedById == userId);
        else if (role == "Reviewer")
            query = query.Where(x => x.AssignedReviewerId == userId);
        // Admin sees all

        var requests = await query.ToListAsync();

        // Recent activity
        var recentActivity = await _context.AuditLogs
            .Include(x => x.ChangedBy)
            .Include(x => x.Request)
            .OrderByDescending(x => x.CreatedDate)
            .Take(10)
            .Select(x => new RecentActivityDto
            {
                RequestId = x.RequestId,
                Title = x.Request.Title,
                Action = x.Action,
                ChangedByName = x.ChangedBy.FullName,
                Date = x.CreatedDate
            })
            .ToListAsync();

        return new DashboardStatsDto
        {
            TotalRequests = requests.Count,
            DraftCount = requests.Count(x => x.Status == RequestStatus.Draft),
            SubmittedCount = requests.Count(x => x.Status == RequestStatus.Submitted),
            InReviewCount = requests.Count(x => x.Status == RequestStatus.InReview),
            ApprovedCount = requests.Count(x => x.Status == RequestStatus.Approved),
            RejectedCount = requests.Count(x => x.Status == RequestStatus.Rejected),
            ProvisioningCount = requests.Count(x => x.Status == RequestStatus.Provisioning),
            ClosedCount = requests.Count(x => x.Status == RequestStatus.Closed),
            RecentActivity = recentActivity
        };
    }
}