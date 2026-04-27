namespace Oakveil.Shared.Definitions;

public class SpriteSheetAnimationDefinition : DefinitionBase
{
    public Guid TextureId { get; set; }
    public int FrameWidth { get; set; }
    public int FrameHeight { get; set; }
}