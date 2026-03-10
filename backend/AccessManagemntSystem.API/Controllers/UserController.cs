using AccessManagementSystem.Application.DTOs.User;
using AccessManagementSystem.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccessManagemntSystem.API.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // GET api/users/reviewers ← must be BEFORE {id} route
    [HttpGet("reviewers")]
    [Authorize]
    public async Task<IActionResult> GetReviewers()
    {
        var users = await _userService.GetAllUsersAsync();
        var reviewers = users
            .Where(u => u.Role == "Reviewer" || u.Role == "Admin")
            .ToList();
        return Ok(reviewers);
    }

    // GET api/users
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    // GET api/users/{id}
    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        return Ok(user);
    }

    // POST api/users
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var user = await _userService.CreateUserAsync(dto);
        return Ok(user);
    }

    // PUT api/users/{id}
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var user = await _userService.UpdateUserAsync(id, dto);
        return Ok(user);
    }

    // DELETE api/users/{id}
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _userService.DeleteUserAsync(id);
        return Ok(new { message = "User deleted successfully" });
    }
}