namespace Oakveil.Shared.Definitions;

public class UserDefinition
{
    public Guid Id { get; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public List<string> Roles { get; set; } = [];

    public UserDefinition()
    {
        Id = Guid.NewGuid();
    }
}