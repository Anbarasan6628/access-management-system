using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Domain.Enums;

namespace AccessManagementSystem.Domain.Entities
{
    public class ChangeRequest : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public Category Category { get; set; }
        public Priority Priority { get; set; }
        public string? AttachmentPath { get; set; }
        public int AssignedReviewerId { get; set; }
        public User AssignedReviewer { get; set; }
        public int CreatedById { get; set; }
        public User CreatedBy { get; set; }
        public RequestStatus Status { get; set; } = RequestStatus.Draft;

        // ── AI Risk Cache ──────────────────────────
        public int? RiskScore { get; set; }   // 1-10
        public string? RiskLevel { get; set; }   // Low / Medium / High
        public string? RiskReason { get; set; }   // one sentence
    }
}