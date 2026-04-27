namespace Oakveil.Shared.Enums;

public enum InteractionNodeType
{
    Dialogue,
    Choice,
    Branch,

    StartQuest,
    CompleteQuest,
    GiveQuestRewards,

    GiveItem,
    TakeItem,

    OpenVendor,
    OpenBank,

    Teleport,

    TriggerInteraction,

    End
}