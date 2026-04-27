using MediatR;
using Oakveil.Backend.Application.Auth.Commands;
using Oakveil.Backend.Application.Auth.Models;

namespace Oakveil.Backend.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", async (LoginRequest request, ISender sender, CancellationToken ct) =>
            {
                var result = await sender.Send(new LoginCommand(request.Email, request.Password), ct);
                return Results.Ok(result);
            })
            .AllowAnonymous();

        return app;
    }
}
