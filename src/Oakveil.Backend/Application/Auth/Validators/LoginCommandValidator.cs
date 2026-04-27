using FluentValidation;
using Oakveil.Backend.Application.Auth.Commands;

namespace Oakveil.Backend.Application.Auth.Validators;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
    }
}
