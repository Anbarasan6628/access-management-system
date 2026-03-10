using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessManagementSystem.Application.DTOs.Dashboard
{
    public class DashboardStatsDto
    {
        public int TotalRequests { get; set; }
        public int DraftCount { get; set; }
        public int SubmittedCount { get; set; }
        public int InReviewCount { get; set; }
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
        public int ProvisioningCount { get; set; }
        public int ClosedCount { get; set; }
        public List<RecentActivityDto> RecentActivity { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public int RequestId { get; set; }
        public string Title { get; set; }
        public string Action { get; set; }
        public string ChangedByName { get; set; }
        public DateTime Date { get; set; }
    }
}
