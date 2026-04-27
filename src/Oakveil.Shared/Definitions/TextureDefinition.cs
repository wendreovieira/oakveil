namespace Oakveil.Shared.Definitions;

public class TextureDefinition : DefinitionBase
{
    public string Path { get; set; }
    
    public bool PixelPerfect { get; set; }
    
    public int? FrameWidth { get; set; }
    
    public int? FrameHeight { get; set; }

    public List<string> Tags { get; set; } = new();
}