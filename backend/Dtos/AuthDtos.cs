namespace PasswordManagerAPI.Dtos;

public record RegisterDto(string Email, string Password);
public record LoginDto(string Email, string Password);
public record TokenResponseDto(string Token, string Email);