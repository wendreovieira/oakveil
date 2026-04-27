using Oakveil.Backend.Domain.Services;

namespace Oakveil.Backend.Tests.Fakes;

public sealed class FakeAssetStorageService : IAssetStorageService
{
    public Task<AssetUploadResult> UploadAsync(Stream stream, string objectKey, string contentType, bool isPublic, CancellationToken cancellationToken)
    {
        var url = isPublic ? $"https://fake-r2.local/public/{objectKey}" : $"https://fake-r2.local/private/{objectKey}";
        return Task.FromResult(new AssetUploadResult(objectKey, url));
    }

    public Task DeleteAsync(string objectKey, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public string GetPublicUrl(string objectKey)
    {
        return $"https://fake-r2.local/public/{objectKey}";
    }

    public string GetSignedReadUrl(string objectKey, TimeSpan ttl)
    {
        return $"https://fake-r2.local/signed/{objectKey}?ttl={(int)ttl.TotalSeconds}";
    }
}
