using AccessManagementSystem.Application.DTOs.Request;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AccessManagemntSystem.API.Controllers;

[ApiController]
[Route("api/requests")]
[Authorize]
public class RequestController : ControllerBase
{
    private readonly IRequestService _requestService;
    private readonly IAIService _aiService;

    public RequestController(
        IRequestService requestService,
        IAIService aiService)
    {
        _requestService = requestService;
        _aiService = aiService;
    }

    // GET api/requests
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;
        var result = await _requestService.GetAllAsync(
            userId, role, pageNumber, pageSize);
        return Ok(result);
    }

    // GET api/requests/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _requestService.GetByIdAsync(id);
        return Ok(result);
    }

    // POST api/requests
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Create([FromForm] CreateRequestDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _requestService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    // PUT api/requests/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateRequestDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _requestService.UpdateAsync(id, dto, userId);
        return Ok(result);
    }

    // POST api/requests/{id}/submit
    [HttpPost("{id}/submit")]
    [Authorize(Roles = "Employee")]
    public async Task<IActionResult> Submit(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.SubmitAsync(id, userId);
        return Ok(new { message = "Request submitted successfully" });
    }

    // POST api/requests/{id}/review
    [HttpPost("{id}/review")]
    [Authorize(Roles = "Reviewer,Admin")]
    public async Task<IActionResult> StartReview(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.StartReviewAsync(id, userId);
        return Ok(new { message = "Request is now In Review" });
    }

    // POST api/requests/{id}/approve
    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Reviewer,Admin")]
    public async Task<IActionResult> Approve(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.ApproveAsync(id, userId);
        return Ok(new { message = "Request approved successfully" });
    }

    // POST api/requests/{id}/reject
    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Reviewer,Admin")]
    public async Task<IActionResult> Reject(int id, [FromBody] RejectRequestDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.RejectAsync(id, userId, dto.Reason);
        return Ok(new { message = "Request rejected successfully" });
    }

    // POST api/requests/{id}/sendback
    [HttpPost("{id}/sendback")]
    [Authorize(Roles = "Reviewer,Admin")]
    public async Task<IActionResult> SendBack(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.SendBackAsync(id, userId);
        return Ok(new { message = "Request sent back to draft" });
    }

    // POST api/requests/{id}/provision
    [HttpPost("{id}/provision")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Provision(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.ProvisionAsync(id, userId);
        return Ok(new { message = "Provisioning started" });
    }

    // POST api/requests/{id}/close
    [HttpPost("{id}/close")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Close(int id)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _requestService.CloseAsync(id, userId);
        return Ok(new { message = "Request closed successfully" });
    }

    // ── AI: Score risk (with cache + auto-approve) ────────────
    [HttpPost("{id}/score-risk")]
    [Authorize]
    public async Task<IActionResult> ScoreRisk(int id)
    {
        var request = await _requestService.GetByIdAsync(id);
        if (request == null)
            return NotFound();

        // ── Cache hit — return instantly from DB ──────
        if (request.RiskScore.HasValue)
        {
            return Ok(new
            {
                score = request.RiskScore,
                level = request.RiskLevel,
                reason = request.RiskReason,
                autoApprove = request.RiskScore <= 3,
                fromCache = true
            });
        }

        // ── Cache miss — call AI ──────────────────────
        var result = await _aiService.ScoreRiskAsync(
            request.Title,
            request.Category.ToString(),
            request.Priority.ToString(),
            request.Description ?? string.Empty);

        // ── Save to DB ────────────────────────────────
        await _requestService.SaveRiskScoreAsync(
            id,
            result.Score,
            result.Level,
            result.Reason);

        // ── Auto approve if score <= 3 ────────────────
        if (result.AutoApprove)
            await _requestService.AutoApproveAsync(id);

        return Ok(result);
    }

    // ── AI: Suggest description ───────────────────────────────
    [HttpPost("suggest-description")]
    [Authorize]
    public async Task<IActionResult> SuggestDescription(
        [FromBody] SuggestDescriptionRequest body)
    {
        var result = await _aiService.SuggestDescriptionAsync(
            body.Title,
            body.Category);

        return Ok(new { description = result });
    }
}

public record SuggestDescriptionRequest(
    string Title,
    string Category);

public record RejectRequestDto(string Reason);