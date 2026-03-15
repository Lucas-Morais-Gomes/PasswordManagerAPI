using FluentAssertions;
using Microsoft.Extensions.Configuration;
using PasswordManagerAPI.Services;
using Xunit;

namespace PasswordManagerAPI.Tests;

public class EncryptionServiceTests
{
    private readonly EncryptionService _encryptionService;
    private const string TestKey = "12345678901234567890123456789012";
    private const string TestUserSalt = "usuario-teste-salt-123";

    public EncryptionServiceTests()
    {
        var inMemorySettings = new Dictionary<string, string?> {
            {"EncryptionSettings:Key", TestKey},
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        _encryptionService = new EncryptionService(configuration);
    }

    [Theory]
    [InlineData("SenhaSuperSecreta123")]
    [InlineData("MinhaPalavraPasse")]
    [InlineData("!@#$%^&*()_+")]
    public void Encrypt_ShouldReturnCipherText_ThatCanBeDecrypted(string plainText)
    {
        // Act
        var encrypted = _encryptionService.Encrypt(plainText, TestUserSalt);
        var decrypted = _encryptionService.Decrypt(encrypted, TestUserSalt);

        // Assert
        decrypted.Should().Be(plainText);
        encrypted.Should().NotBe(plainText);
    }

    [Fact]
    public void Encrypt_ShouldProduceDifferentCipherTexts_ForSameInputDueToIV()
    {
        // Arrange
        var plainText = "MesmaSenha";

        // Act
        var encrypted1 = _encryptionService.Encrypt(plainText, TestUserSalt);
        var encrypted2 = _encryptionService.Encrypt(plainText, TestUserSalt);

        // Assert
        encrypted1.Should().NotBe(encrypted2, "Cada encriptação deve usar um IV aleatório diferente.");
    }

    [Fact]
    public void Encrypt_ShouldProduceDifferentCipherTexts_ForDifferentUserSalts()
    {
        // Arrange
        var plainText = "SenhaComum";
        var salt1 = "salt-usuario-1";
        var salt2 = "salt-usuario-2";

        // Act
        var encrypted1 = _encryptionService.Encrypt(plainText, salt1);
        var encrypted2 = _encryptionService.Encrypt(plainText, salt2);

        // Assert
        encrypted1.Should().NotBe(encrypted2, "Usuarios diferentes com a mesma senha devem ter ciphertexts diferentes devido ao salt.");
    }

    [Fact]
    public void Decrypt_WithWrongSalt_ShouldFail()
    {
        // Arrange
        var plainText = "DadosSensiveis";
        var encrypted = _encryptionService.Encrypt(plainText, "salt-correto");

        // Act & Assert
        Assert.ThrowsAny<System.Exception>(() => _encryptionService.Decrypt(encrypted, "salt-errado"));
    }
}
