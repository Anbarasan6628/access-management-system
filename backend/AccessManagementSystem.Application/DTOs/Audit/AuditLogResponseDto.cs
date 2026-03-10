using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessManagementSystem.Application.DTOs.Audit
{
    public class AuditLogResponseDto
    {
        public int Id { get; set; }
        public int RequestId { get; set; }
        public string Action { get; set; }
        public string OldStatus { get; set; }
        public string NewStatus { get; set; }
        public string ChangedByName { get; set; }
        public string? Remarks { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
