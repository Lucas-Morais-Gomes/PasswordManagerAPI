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
[Authorize] 
public class VaultController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly EncryptionService _encryptionService;

    public VaultController(AppDbContext context, EncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

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

    [HttpDelete("all")]
    public async Task<ActionResult> DeleteAllPasswords()
    {
        var userId = GetUserId();
        
        var deletedCount = await _context.VaultItems
            .Where(v => v.UserId == userId)
            .ExecuteDeleteAsync();

        if (deletedCount == 0)
            return BadRequest("Seu cofre já está vazio.");
            
        return Ok(new { message = "Todas as senhas foram excluídas com sucesso." });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdatePassword(int id, CreateVaultItemDto request)
    {
        var userId = GetUserId();
        
        var item = await _context.VaultItems.FirstOrDefaultAsync(v => v.Id == id && v.UserId == userId);

        if (item == null) return NotFound("Item não encontrado ou acesso negado.");
        
        item.SiteName = request.SiteName;
        item.Username = request.Username;
        
        item.EncryptedPassword = _encryptionService.Encrypt(request.Password);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Senha atualizada com sucesso!" });
    }

    [HttpPost("import")]
    public async Task<ActionResult> ImportPasswords(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Nenhum arquivo foi enviado ou o arquivo está vazio.");

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest("O arquivo deve ser um formato .csv válido.");

        var userId = GetUserId();
        int importedCount = 0;

        using (var stream = new StreamReader(file.OpenReadStream()))
        {
            var headerLine = await stream.ReadLineAsync();
            if (string.IsNullOrWhiteSpace(headerLine)) 
                return BadRequest("O arquivo CSV está vazio ou inválido.");

            var headers = headerLine.Split(',').Select(h => h.Trim().ToLower()).ToList();
            var nameIndex = headers.IndexOf("name");
            var usernameIndex = headers.IndexOf("username");
            var passwordIndex = headers.IndexOf("password");

            if (nameIndex == -1 || usernameIndex == -1 || passwordIndex == -1)
                return BadRequest("O CSV deve conter obrigatoriamente as colunas: 'name', 'username' e 'password'.");

            while (!stream.EndOfStream)
            {
                var line = await stream.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                var values = line.Split(',');

                if (values.Length <= Math.Max(nameIndex, Math.Max(usernameIndex, passwordIndex))) 
                    continue;

                var siteName = values[nameIndex].Trim();
                var username = values[usernameIndex].Trim();
                var password = values[passwordIndex].Trim();

                if (string.IsNullOrWhiteSpace(siteName) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(username)) 
                    continue;

                var encryptedPassword = _encryptionService.Encrypt(password);

                var newItem = new VaultItem
                {
                    UserId = userId,
                    SiteName = siteName,
                    Username = username,
                    EncryptedPassword = encryptedPassword
                };

                _context.VaultItems.Add(newItem);
                importedCount++;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = $"{importedCount} senhas foram importadas com sucesso!" });
    }
}