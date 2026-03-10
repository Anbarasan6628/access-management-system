using Microsoft.AspNetCore.Http;
using AccessManagementSystem.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessManagementSystem.Application.DTOs.Request
{
    public class CreateRequestDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public Category Category { get; set; }
        public Priority Priority { get; set; }
        public int AssignedReviewerId { get; set; }
        public IFormFile? Attachment { get; set; }
    }
}
