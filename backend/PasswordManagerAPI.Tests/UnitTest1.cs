using Xunit;

namespace PasswordManagerAPI.Tests;

public class BasicTests
{
    [Fact]
    public void TesteMatematico_GaranteQueOAmbienteDeTesteFunciona()
    {
        // Arrange (Preparar)
        int a = 5;
        int b = 5;

        // Act (Agir)
        int resultado = a + b;

        // Assert (Verificar)
        Assert.Equal(10, resultado);
    }
}