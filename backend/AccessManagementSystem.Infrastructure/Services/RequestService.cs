using AccessManagementSystem.Application.DTOs.Common;
using AccessManagementSystem.Application.DTOs.Request;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Domain.Entities;
using AccessManagementSystem.Domain.Enums;
using AccessManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AccessManagementSystem.Infrastructure.Services;

public class RequestService : IRequestService
{
    private readonly AppDbContext _context;
    private readonly IFileService _fileService;

    public RequestService(AppDbContext context, IFileService fileService)
    {
        _context = context;
        _fileService = fileService;
    }

    // ── CREATE ────────────────────────────────────────
    public async Task<RequestResponseDto> CreateAsync(CreateRequestDto dto, int createdById)
    {
        string? attachmentPath = null;

        if (dto.Attachment != null)
            attachmentPath = await _fileService.UploadFileAsync(dto.Attachment);

        var request = new ChangeRequest
        {
            Title = dto.Title,
            Description = dto.Description,
            Category = dto.Category,
            Priority = dto.Priority,
            AttachmentPath = attachmentPath,
            AssignedReviewerId = dto.AssignedReviewerId,
            CreatedById = createdById,
            Status = RequestStatus.Draft
        };

        _context.ChangeRequests.Add(request);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(request.Id);
    }

    // ── UPDATE ────────────────────────────────────────
    public async Task<RequestResponseDto> UpdateAsync(int id, UpdateRequestDto dto, int userId)
    {
        var request = await _context.ChangeRequests
            .FirstOrDefaultAsync(x => x.Id == id && x.CreatedById == userId);

        if (request == null)
            throw new Exception("Request not found");

        if (request.Status != RequestStatus.Draft)
            throw new Exception("Only Draft requests can be edited");

        if (dto.Attachment != null)
        {
            if (!string.IsNullOrEmpty(request.AttachmentPath))
                _fileService.DeleteFile(request.AttachmentPath);

            request.AttachmentPath = await _fileService.UploadFileAsync(dto.Attachment);
        }

        request.Title = dto.Title;
        request.Description = dto.Description;
        request.Category = dto.Category;
        request.Priority = dto.Priority;
        request.AssignedReviewerId = dto.AssignedReviewerId;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(request.Id);
    }

    // ── GET BY ID ─────────────────────────────────────
    public async Task<RequestResponseDto> GetByIdAsync(int id)
    {
        var request = await _context.ChangeRequests
            .Include(x => x.CreatedBy)
            .Include(x => x.AssignedReviewer)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            throw new Exception("Request not found");

        return MapToDto(request);
    }

    // ── GET ALL (Paginated) ───────────────────────────
    public async Task<PagedResultDto<RequestResponseDto>> GetAllAsync(
        int userId, string role, int pageNumber = 1, int pageSize = 10)
    {
        var query = _context.ChangeRequests
            .Include(x => x.CreatedBy)
            .Include(x => x.AssignedReviewer)
            .AsQueryable();

        // Filter by role
        if (role == "Employee")
            query = query.Where(x => x.CreatedById == userId);
        else if (role == "Reviewer")
            query = query.Where(x => x.AssignedReviewerId == userId);
        // Admin sees all

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(x => x.CreatedDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResultDto<RequestResponseDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    // ── STATE TRANSITIONS ─────────────────────────────
    public async Task SubmitAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Submitted);
        await ChangeStatusAsync(request, RequestStatus.Submitted, userId, "Submitted for review");
    }

    public async Task ApproveAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Approved);
        await ChangeStatusAsync(request, RequestStatus.Approved, userId, "Approved");
    }

    public async Task RejectAsync(int id, int userId, string reason)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Rejected);
        await ChangeStatusAsync(request, RequestStatus.Rejected, userId, $"Rejected: {reason}");
    }

    public async Task SendBackAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Draft);
        await ChangeStatusAsync(request, RequestStatus.Draft, userId, "Sent back to Draft");
    }

    public async Task ProvisionAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Provisioning);
        await ChangeStatusAsync(request, RequestStatus.Provisioning, userId, "Provisioning started");
    }

    public async Task CloseAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.Closed);
        await ChangeStatusAsync(request, RequestStatus.Closed, userId, "Closed");
    }

    // ── PRIVATE HELPERS ───────────────────────────────
    private async Task<ChangeRequest> GetRequestAsync(int id)
    {
        var request = await _context.ChangeRequests
            .FirstOrDefaultAsync(x => x.Id == id);

        if (request == null)
            throw new Exception("Request not found");

        return request;
    }

    private void ValidateTransition(RequestStatus current, RequestStatus next)
    {
        var validTransitions = new Dictionary<RequestStatus, List<RequestStatus>>
        {
            { RequestStatus.Draft,        new() { RequestStatus.Submitted } },
            { RequestStatus.Submitted,    new() { RequestStatus.InReview } },
            { RequestStatus.InReview,     new() { RequestStatus.Approved, RequestStatus.Rejected, RequestStatus.Draft } },
            { RequestStatus.Approved,     new() { RequestStatus.Provisioning } },
            { RequestStatus.Provisioning, new() { RequestStatus.Closed } },
        };

        if (!validTransitions.ContainsKey(current) ||
            !validTransitions[current].Contains(next))
            throw new Exception($"Invalid transition from {current} to {next}");
    }

    private async Task ChangeStatusAsync(
        ChangeRequest request,
        RequestStatus newStatus,
        int userId,
        string action)
    {
        var oldStatus = request.Status;
        request.Status = newStatus;

        var audit = new AuditLog
        {
            RequestId = request.Id,
            Action = action,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedById = userId,
            Remarks = action
        };

        _context.AuditLogs.Add(audit);
        await _context.SaveChangesAsync();
    }

    // Add after SubmitAsync method
    public async Task StartReviewAsync(int id, int userId)
    {
        var request = await GetRequestAsync(id);
        ValidateTransition(request.Status, RequestStatus.InReview);
        await ChangeStatusAsync(request, RequestStatus.InReview, userId, "Review started");
    }

    private RequestResponseDto MapToDto(ChangeRequest request)
    {
        return new RequestResponseDto
        {
            Id = request.Id,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category.ToString(),
            Priority = request.Priority.ToString(),
            Status = request.Status.ToString(),
            AttachmentPath = request.AttachmentPath,
            AttachmentUrl = request.AttachmentPath != null
                ? $"https://localhost:44363{request.AttachmentPath}"
                : null,
            AssignedReviewerName = request.AssignedReviewer?.FullName ?? "",
            CreatedByName = request.CreatedBy?.FullName ?? "",
            CreatedDate = request.CreatedDate,
            UpdatedDate = request.UpdatedDate
        };
    }
}