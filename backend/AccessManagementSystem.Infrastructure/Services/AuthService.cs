using AccessManagementSystem.Application.DTOs.Auth;
using AccessManagementSystem.Application.Interfaces;
using AccessManagementSystem.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AccessManagementSystem.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto loginRequest)
    {                                                        // ↑ must match exactly
        // Step 1 — Find user by EmployeeId
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.EmployeeId == loginRequest.EmployeeId);

        // Step 2 — Verify password
        if (user == null || !BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid Employee ID or password");

        // Step 3 — Build claims
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("EmployeeId", user.EmployeeId),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };

        // Step 4 — Create signing key
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]));

        // Step 5 — Create credentials
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Step 6 — Set expiry
        var expiry = DateTime.UtcNow.AddHours(
            double.Parse(_config["Jwt:ExpiryHours"]));

        // Step 7 — Build token
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: creds
        );

        // Step 8 — Return response
        return new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            EmployeeId = user.EmployeeId,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            ExpiresAt = expiry
        };
    }
}