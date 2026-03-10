using AccessManagementSystem.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace AccessManagementSystem.Application.DTOs.Request;

public class UpdateRequestDto
{
    public string Title { get; set; }
    public string Description { get; set; }
    public Category Category { get; set; }
    public Priority Priority { get; set; }
    public int AssignedReviewerId { get; set; }
    public IFormFile? Attachment { get; set; }
}