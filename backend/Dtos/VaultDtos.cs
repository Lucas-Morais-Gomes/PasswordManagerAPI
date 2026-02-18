namespace PasswordManagerAPI.Dtos;

// O que o usuário envia para salvar
public record CreateVaultItemDto(string SiteName, string Username, string Password);

// O que a API devolve (sem a senha descriptografada inicialmente por segurança)
public record VaultItemResponseDto(int Id, string SiteName, string Username);

// Resposta específica quando pede para revelar a senha
public record DecryptedPasswordDto(string Password);