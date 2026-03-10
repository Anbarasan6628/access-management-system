using AccessManagementSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AccessManagemntSystem.API.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize]
public class AuditController : ControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    // GET api/audit/{requestId}
    [HttpGet("{requestId}")]
    public async Task<IActionResult> GetAuditHistory(int requestId)
    {
        var result = await _auditService.GetAuditHistoryAsync(requestId);
        return Ok(result);
    }
}