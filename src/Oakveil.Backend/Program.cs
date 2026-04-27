using Oakveil.Backend.Api.Endpoints;
using Oakveil.Backend.Api.Middleware;
using Oakveil.Backend.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddBackendServices(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapAssetEndpoints();
app.MapDefinitionEndpoints();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();

app.Run();