namespace Oakveil.Backend.Configuration;

public sealed class SeedUserSettings
{
    public bool Enabled { get; set; } = true;
    public string Username { get; set; } = "wendreo";
    public string Password { get; set; } = "140718";
    public List<string> Roles { get; set; } = ["Admin", "Editor", "Viewer"];
}
