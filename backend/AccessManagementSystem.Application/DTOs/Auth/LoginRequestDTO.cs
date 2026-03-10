using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AccessManagementSystem.Application.DTOs.Auth
{
    public class LoginRequestDto
    {
        public string EmployeeId { get; set; }
        public string Password { get; set; }
    }
}
