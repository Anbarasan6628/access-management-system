namespace AccessManagementSystem.Application.DTOs;

public class RiskResultDto
{
    public int Score { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public bool AutoApprove { get; set; }
}