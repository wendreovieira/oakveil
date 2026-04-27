using FluentValidation;
using Oakveil.Backend.Application.Definitions.Commands;

namespace Oakveil.Backend.Application.Definitions.Validators;

public sealed class DeleteDefinitionCommandValidator : AbstractValidator<DeleteDefinitionCommand>
{
    public DeleteDefinitionCommandValidator()
    {
        RuleFor(x => x.DefinitionType)
            .NotEmpty()
            .Must(DefinitionTypeRegistry.IsKnown)
            .WithMessage("Unknown definition type.");

        RuleFor(x => x.Id).NotEmpty();
    }
}
