namespace Oakveil.Shared.Enums;

public enum InteractionConditionType
{
    HasItem,
    HasEquippedItem,

    HasQuestActive,
    HasQuestCompleted,

    SkillLevelAtLeast,

    InventoryContainsTag,
    EquippedTag,

    HasInteractedWithObject,
    KilledEnemyCount,

    RandomChance,

    Always
}