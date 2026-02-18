using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PasswordManagerAPI.Data;
using PasswordManagerAPI.Dtos;
using PasswordManagerAPI.Models;
using PasswordManagerAPI.Services;

namespace PasswordManagerAPI.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Exige Login (JWT) para tudo aqui
public class VaultController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EncryptionService _encryptionService;

    public VaultController(AppDbContext context, EncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    // Pega o ID do usuário do Token JWT
    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<ActionResult<List<VaultItemResponseDto>>> GetMyPasswords()
    {
        var userId = GetUserId();
        var items = await _context.VaultItems
            .Where(v => v.UserId == userId)
            .Select(v => new VaultItemResponseDto(v.Id, v.SiteName, v.Username))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult> AddPassword(CreateVaultItemDto request)
    {
        var encryptedPassword = _encryptionService.Encrypt(request.Password);

        var newItem = new VaultItem
        {
            UserId = GetUserId(),
            SiteName = request.SiteName,
            Username = request.Username,
            EncryptedPassword = encryptedPassword
        };

        _context.VaultItems.Add(newItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Senha salva com sucesso!" });
    }

    [HttpGet("decrypt/{id}")]
    public async Task<ActionResult<DecryptedPasswordDto>> GetDecryptedPassword(int id)
    {
        var userId = GetUserId();
        var item = await _context.VaultItems.FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

        if (item == null) return NotFound("Item não encontrado ou acesso negado.");

        var plainPassword = _encryptionService.Decrypt(item.EncryptedPassword);
        return Ok(new DecryptedPasswordDto(plainPassword));
    }
    
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePassword(int id)
    {
        var userId = GetUserId();
        var item = await _context.VaultItems.FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);
        
        if (item == null) return NotFound();
        
        _context.VaultItems.Remove(item);
        await _context.SaveChangesAsync();
        
        return NoContent();
    }
}