using AccessManagementSystem.Application.DTOs;

namespace AccessManagementSystem.Application.Interfaces;

public interface IAIService
{
    Task<RiskResultDto> ScoreRiskAsync(string title,
                                       string category,
                                       string priority,
                                       string description);

    Task<string> SuggestDescriptionAsync(string title,
                                          string category);

    Task<string> GenerateClosureSummaryAsync(string requestTitle,
                                              string auditHistory);
}