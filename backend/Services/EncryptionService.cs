using System.Security.Cryptography;
using System.Text;

namespace PasswordManagerAPI.Services;

public class EncryptionService
{
    private readonly string _globalKey;
    private const int Iterations = 100_000; // PBKDF2 cost factor
    private const int KeySize = 32; // 256 bits

    public EncryptionService(IConfiguration config)
    {
        _globalKey = config["EncryptionSettings:Key"] ?? throw new ArgumentNullException("EncryptionKey is missing");
    }

    /// <summary>
    /// Deriva uma chave AES-256 única combinando a chave global com o salt individual do usuário.
    /// </summary>
    private byte[] DeriveKey(string userSalt)
    {
        // PBKDF2 (Rfc2898DeriveBytes) é o padrão da indústria para derivação de chaves
        using var pbkdf2 = new Rfc2898DeriveBytes(_globalKey, Encoding.UTF8.GetBytes(userSalt), Iterations, HashAlgorithmName.SHA256);
        return pbkdf2.GetBytes(KeySize);
    }

    public string Encrypt(string plainText, string userSalt)
    {
        var key = DeriveKey(userSalt);
        
        using var aes = Aes.Create();
        aes.Key = key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        
        ms.Write(aes.IV, 0, aes.IV.Length);

        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }

        return Convert.ToBase64String(ms.ToArray());
    }

    public string Decrypt(string cipherText, string userSalt)
    {
        var fullCipher = Convert.FromBase64String(cipherText);
        var key = DeriveKey(userSalt);

        using var aes = Aes.Create();
        aes.Key = key;

        var iv = new byte[16];
        Array.Copy(fullCipher, 0, iv, 0, iv.Length);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream(fullCipher, 16, fullCipher.Length - 16);
        using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using var sr = new StreamReader(cs);

        return sr.ReadToEnd();
    }
}
