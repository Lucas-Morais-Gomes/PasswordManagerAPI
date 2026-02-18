namespace PasswordManagerAPI.Models;

public class VaultItem
{
    public int Id { get; set; }
    public int UserId { get; set; } // Chave estrangeira
    public string SiteName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string EncryptedPassword { get; set; } = string.Empty;
}