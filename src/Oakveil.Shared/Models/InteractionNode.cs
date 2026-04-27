using Oakveil.Shared.Enums;

namespace Oakveil.Shared.Models;

public sealed class InteractionNode
{
    public required string Id { get; set; }

    public InteractionNodeType Type { get; set; }

    // Default linear transition used by simple nodes.
    public string? NextNodeId { get; set; }

    public List<InteractionCondition> Conditions { get; set; } = [];

    // Dialogue payload.
    public string? DialogueTranslationId { get; set; }
    public List<string> DialogueVariantTranslationIds { get; set; } = [];

    // Choice payload.
    public List<InteractionChoiceOption> ChoiceOptions { get; set; } = [];

    // Branch payload.
    public List<InteractionBranchOption> BranchOptions { get; set; } = [];

    // Quest payload.
    public string? QuestDefinitionId { get; set; }

    // Item payload.
    public string? ItemDefinitionId { get; set; }
    public int ItemAmount { get; set; } = 1;

    // Vendor and bank payload.
    public string? VendorId { get; set; }
    public string? BankId { get; set; }

    // Teleport payload.
    public InteractionTeleportTarget? TeleportTarget { get; set; }

    // Trigger another interaction definition.
    public string? TargetInteractionDefinitionId { get; set; }

    // Free-form extensibility for custom runtime behavior.
    public Dictionary<string, string> Metadata { get; set; } = [];
}