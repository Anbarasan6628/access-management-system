using AccessManagementSystem.Application.DTOs.User;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Domain.Entities;
using AccessManagementSystem.Domain.Enums;
using AccessManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AccessManagementSystem.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    // GET ALL
    public async Task<List<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _context.Users
            .OrderBy(x => x.FullName)
            .ToListAsync();

        return users.Select(MapToDto).ToList();
    }

    // GET BY ID
    public async Task<UserResponseDto> GetUserByIdAsync(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
            throw new Exception("User not found");

        return MapToDto(user);
    }

    // CREATE
    public async Task<UserResponseDto> CreateUserAsync(CreateUserDto dto)
    {
        // Check duplicate EmployeeId
        var exists = await _context.Users
            .AnyAsync(x => x.EmployeeId == dto.EmployeeId);

        if (exists)
            throw new Exception("Employee ID already exists");

        // Check duplicate Email
        var emailExists = await _context.Users
            .AnyAsync(x => x.Email == dto.Email);

        if (emailExists)
            throw new Exception("Email already exists");

        var user = new User
        {
            EmployeeId = dto.EmployeeId,
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = Enum.Parse<UserRole>(dto.Role),
            Department = dto.Department
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    // UPDATE
    public async Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
            throw new Exception("User not found");

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.Role = Enum.Parse<UserRole>(dto.Role);
        user.Department = dto.Department;

        await _context.SaveChangesAsync();

        return MapToDto(user);
    }

    // DELETE (soft delete)
    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user == null)
            throw new Exception("User not found");

        user.IsDeleted = true;  // ← soft delete
        await _context.SaveChangesAsync();
    }

    // MAP
    private UserResponseDto MapToDto(User user)
    {
        return new UserResponseDto
        {
            Id = user.Id,
            EmployeeId = user.EmployeeId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Department = user.Department,
            CreatedDate = user.CreatedDate
        };
    }
}