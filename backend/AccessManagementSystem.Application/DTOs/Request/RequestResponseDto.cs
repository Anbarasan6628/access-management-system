namespace AccessManagementSystem.Application.DTOs.Request;

public class RequestResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Category { get; set; }
    public string Priority { get; set; }
    public string Status { get; set; }
    public string? AttachmentPath { get; set; }
    public string? AttachmentUrl { get; set; }
    public string AssignedReviewerName { get; set; }
    public string CreatedByName { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime UpdatedDate { get; set; }

    // ── AI Risk Cache ──────────────────────────────
    public int? RiskScore { get; set; }
    public string? RiskLevel { get; set; }
    public string? RiskReason { get; set; }
}