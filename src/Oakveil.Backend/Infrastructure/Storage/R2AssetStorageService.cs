using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Services;

namespace Oakveil.Backend.Infrastructure.Storage;

public sealed class R2AssetStorageService : IAssetStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly S3Settings _settings;

    public R2AssetStorageService(IAmazonS3 s3Client, IOptions<S3Settings> settings)
    {
        _s3Client = s3Client;
        _settings = settings.Value;
    }

    public async Task<AssetUploadResult> UploadAsync(Stream stream, string objectKey, string contentType, bool isPublic, CancellationToken cancellationToken)
    {
        var request = new PutObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = objectKey,
            InputStream = stream,
            ContentType = contentType,
            DisablePayloadSigning = true,
            DisableDefaultChecksumValidation = true
        };

        if (isPublic)
        {
            request.Headers.CacheControl = "public, max-age=31536000, immutable";
        }

        await _s3Client.PutObjectAsync(request, cancellationToken);
        var url = isPublic ? GetPublicUrl(objectKey) : GetSignedReadUrl(objectKey, TimeSpan.FromHours(1));
        return new AssetUploadResult(objectKey, url);
    }

    public async Task DeleteAsync(string objectKey, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
        {
            return;
        }

        var request = new DeleteObjectRequest
        {
            BucketName = _settings.BucketName,
            Key = objectKey
        };

        await _s3Client.DeleteObjectAsync(request, cancellationToken);
    }

    public string GetPublicUrl(string objectKey)
    {
        if (!string.IsNullOrWhiteSpace(_settings.PublicBaseUrl))
        {
            return $"{_settings.PublicBaseUrl.TrimEnd('/')}/{objectKey}";
        }

        var baseUrl = _settings.ServiceUrl.TrimEnd('/');
        return $"{baseUrl}/{_settings.BucketName}/{objectKey}";
    }

    public string GetSignedReadUrl(string objectKey, TimeSpan ttl)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = _settings.BucketName,
            Key = objectKey,
            Expires = DateTime.UtcNow.Add(ttl)
        };

        return _s3Client.GetPreSignedURL(request);
    }
}
