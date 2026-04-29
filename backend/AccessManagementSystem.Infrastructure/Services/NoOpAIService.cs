// Infrastructure/Services/NoOpAIService.cs
using AccessManagementSystem.Application.DTOs;
using AccessManagementSystem.Application.Interfaces;

namespace AccessManagementSystem.Infrastructure.Services;

public class NoOpAIService : IAIService
{
    // Copy all method signatures from IAIService and return empty/default values
    // Example — adjust to match your actual IAIService interface:
    public Task<string> GetSuggestionAsync(string prompt)
        => Task.FromResult("AI features not available in this environment.");

    Task<string> IAIService.GenerateClosureSummaryAsync(string requestTitle, string auditHistory)
    {
        throw new NotImplementedException();
    }

    Task<RiskResultDto> IAIService.ScoreRiskAsync(string title, string category, string priority, string description)
    {
        throw new NotImplementedException();
    }

    Task<string> IAIService.SuggestDescriptionAsync(string title, string category)
    {
        throw new NotImplementedException();
    }
}