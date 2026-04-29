using System.Text.Json;
using AccessManagementSystem.Application.DTOs;
using AccessManagementSystem.Application.Interfaces;
using Microsoft.SemanticKernel;

namespace AccessManagementSystem.Infrastructure.Services;

public class AIService : IAIService
{
    private readonly Kernel _kernel;

    public AIService(Kernel kernel)
    {
        _kernel = kernel;
    }

    // ── Method 1: Score risk ──────────────────────────────────
    public async Task<RiskResultDto> ScoreRiskAsync(
        string title,
        string category,
        string priority,
        string description)
    {
        // ✅ $$ means variables = {{double}}
        //       JSON braces = {single} — safe
        var prompt = $$"""
            You are a senior IT risk assessor with 10 years 
            of change management experience.

            Our system is an internal IT Change Management 
            platform. Employees raise requests, Reviewers 
            approve or reject, Admins provision and close.

            Change request submitted:
            Title:       {{title}}
            Category:    {{category}}
            Priority:    {{priority}}
            Description: {{description}}

            Scoring rules:
            - Score 1-3  = Low risk    → autoApprove: true
            - Score 4-6  = Medium risk → autoApprove: false
            - Score 7-10 = High risk   → autoApprove: false
            - Network or firewall changes = always 7+
            - Single machine software install = always 1-3
            - Database changes = always 6+

            Respond ONLY with this exact JSON. No other text:
            {"score": 0, "level": "Low", "reason": "one sentence", "autoApprove": true}
            """;

        var response = await _kernel.InvokePromptAsync(prompt);
        var json = response.ToString();

        return JsonSerializer.Deserialize<RiskResultDto>(json,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? new RiskResultDto
            {
                Score = 5,
                Level = "Medium",
                Reason = "Unable to assess — manual review required",
                AutoApprove = false
            };
    }

    // ── Method 2: Suggest description ────────────────────────
    public async Task<string> SuggestDescriptionAsync(
        string title,
        string category)
    {
        // ✅ $ means variables = {single} — no JSON here so safe
        var prompt = $"""
            You are an IT change management assistant.

            An employee is creating a change request with:
            Title:    {title}
            Category: {category}

            Write a clear, professional description for this 
            request in 2-3 sentences. 
            Focus on: what the change is, why it is needed, 
            and what the expected outcome is.
            Return ONLY the description text. No labels. 
            No JSON. Just the paragraph.
            """;

        var response = await _kernel.InvokePromptAsync(prompt);
        return response.ToString();
    }

    // ── Method 3: Closure summary ─────────────────────────────
    public async Task<string> GenerateClosureSummaryAsync(
        string requestTitle,
        string auditHistory)
    {
        // ✅ $ means variables = {single} — no JSON here so safe
        var prompt = $"""
            You are an IT audit documentation specialist.

            A change request has been completed:
            Title: {requestTitle}

            Audit trail (all actions taken):
            {auditHistory}

            Write a professional closure summary in 3-4 
            sentences covering:
            - What was changed
            - Who approved it
            - How long it took
            - Final outcome

            Return ONLY the summary paragraph. No JSON.
            """;

        var response = await _kernel.InvokePromptAsync(prompt);
        return response.ToString();
    }
}