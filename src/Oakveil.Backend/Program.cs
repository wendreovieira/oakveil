using Oakveil.Backend.Api.Endpoints;
using Oakveil.Backend.Api.Middleware;
using Oakveil.Backend.Infrastructure.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddBackendServices(builder.Configuration);

var app = builder.Build();

await app.Services.EnsureSeedUserAsync();

app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("FrontendCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapAssetEndpoints();
app.MapDefinitionEndpoints();
app.MapSkinEndpoints();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous();

app.Run();

public partial class Program;