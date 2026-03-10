using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Domain.Enums;
namespace AccessManagementSystem.Domain.Entities
{
    public class User : BaseEntity
    {
        public string EmployeeId { get; set; }    // ← add this
        public string FullName { get; set; }
        public string Email { get; set; }         // ← keep for notifications
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public string Department { get; set; }    // ← optional but realistic
    }
}
