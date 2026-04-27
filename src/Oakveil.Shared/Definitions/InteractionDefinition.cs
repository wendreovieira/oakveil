using Oakveil.Shared.Models;

namespace Oakveil.Shared.Definitions;

public sealed class InteractionDefinition : DefinitionBase
{
    public required string Name { get; set; }

    public List<InteractionEntryPoint> EntryPoints { get; set; } = [];

    public List<InteractionNode> Nodes { get; set; } = [];
}