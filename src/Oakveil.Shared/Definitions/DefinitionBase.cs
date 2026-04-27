namespace Oakveil.Shared.Definitions;

public abstract class DefinitionBase
{
    public Guid Id { get; }
    
    public required string Key { get; set; }
    
    public string? CreatedBy { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public string? UpdatedBy { get; set; }
    
    public DateTime? UpdatedAt { get; set; }

    public DefinitionBase()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}