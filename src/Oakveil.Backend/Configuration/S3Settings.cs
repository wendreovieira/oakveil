namespace Oakveil.Backend.Configuration;

public sealed class S3Settings
{
    public string ServiceUrl { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public string Region { get; set; } = "auto";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string? PublicBaseUrl { get; set; }
}
