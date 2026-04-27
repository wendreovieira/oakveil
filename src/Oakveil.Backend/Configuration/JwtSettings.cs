namespace Oakveil.Backend.Configuration;

public sealed class JwtSettings
{
    public string Issuer { get; set; } = "Oakveil";
    public string Audience { get; set; } = "Oakveil.Client";
    public string SecretKey { get; set; } = "change-me-with-a-long-secret-key";
    public int ExpirationMinutes { get; set; } = 120;
}
