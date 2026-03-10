using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessManagementSystem.Application.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string EmployeeId { get; set; }    // ← instead of Email
        public string FullName { get; set; }
        public string Email { get; set; }         // ← keep for display
        public string Role { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
