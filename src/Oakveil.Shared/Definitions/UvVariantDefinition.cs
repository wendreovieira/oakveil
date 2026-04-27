namespace Oakveil.Shared.Definitions;

public class UvVariantDefinition : DefinitionBase
{
    public Guid BaseUvId { get; set; }

    /// imagem resultante da reorganização dos pixels
    public string Path { get; set; }
}