namespace Oakveil.Backend.Application.Auth.Models;

public sealed record LoginResponse(string Token, string Email, IReadOnlyCollection<string> Roles, DateTime ExpiresAtUtc);
