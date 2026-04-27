namespace Oakveil.Shared.Definitions;

public abstract class DefinitionBase
{
    public Guid Id { get; }
    public required string Key { get; set; }

    public DefinitionBase()
    {
        Id = Guid.NewGuid();
    }
}