using MediatR;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions.Commands;

public sealed record DeleteDefinitionCommand(string DefinitionType, Guid Id, string? Actor) : IRequest<bool>;

public sealed class DeleteDefinitionCommandHandler : IRequestHandler<DeleteDefinitionCommand, bool>
{
    private readonly IDefinitionRepository _repository;

    public DeleteDefinitionCommandHandler(IDefinitionRepository repository)
    {
        _repository = repository;
    }

    public Task<bool> Handle(DeleteDefinitionCommand request, CancellationToken cancellationToken)
    {
        return _repository.SoftDeleteAsync(request.DefinitionType, request.Id, request.Actor, cancellationToken);
    }
}
