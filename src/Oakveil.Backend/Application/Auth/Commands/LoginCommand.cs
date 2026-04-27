using MediatR;
using Oakveil.Backend.Application.Auth.Models;
using Oakveil.Backend.Configuration;
using Oakveil.Backend.Domain.Repositories;
using Oakveil.Backend.Domain.Services;
using Microsoft.Extensions.Options;

namespace Oakveil.Backend.Application.Auth.Commands;

public sealed record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;

    public LoginCommandHandler(IUserRepository userRepository, IJwtTokenService jwtTokenService, IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var token = _jwtTokenService.GenerateToken(user.Email, user.Roles);

        return new LoginResponse(
            token,
            user.Email,
            user.Roles,
            DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes));
    }
}
