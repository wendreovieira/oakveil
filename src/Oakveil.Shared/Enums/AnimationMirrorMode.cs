namespace Oakveil.Shared.Enums;

public enum AnimationMirrorMode
{
    None,

    /// mesma animação, mesmo frame
    Synchronized,

    /// frame invertido (último vira primeiro)
    ReverseFrame,

    /// metade de ciclo de diferença
    OppositePhase
}