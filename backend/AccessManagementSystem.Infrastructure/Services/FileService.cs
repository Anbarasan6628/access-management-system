using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AccessManagementSystem.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace AccessManagementSystem.Infrastructure.Services;

// TODO: Day 14 — Replace with Azure Blob Storage
public class FileService : IFileService
{
    private readonly string _uploadPath;

    public FileService(IWebHostEnvironment env)
    {
        _uploadPath = Path.Combine(env.WebRootPath ?? "wwwroot", "uploads");

        if (!Directory.Exists(_uploadPath))
            Directory.CreateDirectory(_uploadPath);
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        // Validate extension
        var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(file.FileName).ToLower();

        if (!allowedExtensions.Contains(extension))
            throw new Exception("File type not allowed. Allowed: pdf, doc, docx, png, jpg, jpeg");

        // Validate size (5MB max)
        if (file.Length > 5 * 1024 * 1024)
            throw new Exception("File size cannot exceed 5MB");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadPath, fileName);

        // Save to wwwroot/uploads/
        using var stream = new FileStream(filePath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"/uploads/{fileName}";
    }

    public void DeleteFile(string filePath)
    {
        var fullPath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            filePath.TrimStart('/'));

        if (File.Exists(fullPath))
            File.Delete(fullPath);
    }
}
