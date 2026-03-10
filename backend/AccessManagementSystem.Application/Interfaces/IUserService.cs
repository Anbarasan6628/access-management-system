using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Application.DTOs.User;

namespace AccessManagementSystem.Application.Interfaces;

public interface IUserService
{
    Task<List<UserResponseDto>> GetAllUsersAsync();
    Task<UserResponseDto> GetUserByIdAsync(int id);
    Task<UserResponseDto> CreateUserAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto dto);
    Task DeleteUserAsync(int id);
}
