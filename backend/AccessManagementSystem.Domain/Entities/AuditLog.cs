using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Domain.Enums;

namespace AccessManagementSystem.Domain.Entities
{
    public class AuditLog : BaseEntity
    {
        public int RequestId { get; set; }
        public ChangeRequest Request { get; set; }
        public string Action { get; set; }
        public RequestStatus OldStatus { get; set; }
        public RequestStatus NewStatus { get; set; }
        public int ChangedById { get; set; }
        public User ChangedBy { get; set; }
        public string? Remarks { get; set; }
    }
}
