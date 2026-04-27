using FluentValidation;
using Oakveil.Backend.Application.Definitions.Queries;

namespace Oakveil.Backend.Application.Definitions.Validators;

public sealed class GetDefinitionByIdQueryValidator : AbstractValidator<GetDefinitionByIdQuery>
{
    public GetDefinitionByIdQueryValidator()
    {
        RuleFor(x => x.DefinitionType)
            .NotEmpty()
            .Must(DefinitionTypeRegistry.IsKnown)
            .WithMessage("Unknown definition type.");

        RuleFor(x => x.Id).NotEmpty();
    }
}
