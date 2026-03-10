using AccessManagementSystem.Application.DTOs.Common;
using AccessManagementSystem.Application.DTOs.Request;

namespace AccessManagementSystem.Application.Interfaces;

public interface IRequestService
{
    // CRUD
    Task<RequestResponseDto> CreateAsync(CreateRequestDto dto, int createdById);
    Task<RequestResponseDto> UpdateAsync(int id, UpdateRequestDto dto, int userId);
    Task<RequestResponseDto> GetByIdAsync(int id);
    Task<PagedResultDto<RequestResponseDto>> GetAllAsync(
        int userId, string role, int pageNumber = 1, int pageSize = 10);

    // State Transitions
    Task SubmitAsync(int id, int userId);
    Task StartReviewAsync(int id, int userId);  // ← ADD THIS
    Task ApproveAsync(int id, int userId);
    Task RejectAsync(int id, int userId, string reason);
    Task SendBackAsync(int id, int userId);
    Task ProvisionAsync(int id, int userId);
    Task CloseAsync(int id, int userId);
}