using FluentAssertions;
using Microsoft.Extensions.Configuration;
using PasswordManagerAPI.Services;
using Xunit;

namespace PasswordManagerAPI.Tests;

public class EncryptionServiceTests
{
    private readonly EncryptionService _encryptionService;
    private const string TestKey = "12345678901234567890123456789012";

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
        var encrypted = _encryptionService.Encrypt(plainText);
        var decrypted = _encryptionService.Decrypt(encrypted);

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
        var encrypted1 = _encryptionService.Encrypt(plainText);
        var encrypted2 = _encryptionService.Encrypt(plainText);

        // Assert
        encrypted1.Should().NotBe(encrypted2, "Cada encriptação deve usar um IV aleatório diferente.");
    }

    [Fact]
    public void Decrypt_WithWrongKey_ShouldFail()
    {
        // Arrange
        var plainText = "DadosSensiveis";
        var encrypted = _encryptionService.Encrypt(plainText);

        var wrongKeySettings = new Dictionary<string, string?> {
            {"EncryptionSettings:Key", "outra-chave-qualquer-32-chars-long"},
        };
        var wrongConfig = new ConfigurationBuilder().AddInMemoryCollection(wrongKeySettings).Build();
        var serviceWithWrongKey = new EncryptionService(wrongConfig);

        // Act & Assert
        Assert.ThrowsAny<System.Exception>(() => serviceWithWrongKey.Decrypt(encrypted));
    }
}
