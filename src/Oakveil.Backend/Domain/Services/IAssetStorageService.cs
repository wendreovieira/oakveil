namespace Oakveil.Backend.Domain.Services;

public interface IAssetStorageService
{
    Task<AssetUploadResult> UploadAsync(Stream stream, string objectKey, string contentType, bool isPublic, CancellationToken cancellationToken);
    Task DeleteAsync(string objectKey, CancellationToken cancellationToken);
    string GetPublicUrl(string objectKey);
    string GetSignedReadUrl(string objectKey, TimeSpan ttl);
}

public sealed record AssetUploadResult(string ObjectKey, string Url);
