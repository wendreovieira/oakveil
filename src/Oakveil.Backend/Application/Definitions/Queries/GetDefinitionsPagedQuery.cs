using MediatR;
using Oakveil.Backend.Application.Common;
using Oakveil.Backend.Domain.Repositories;

namespace Oakveil.Backend.Application.Definitions.Queries;

public sealed record GetDefinitionsPagedQuery(
    string DefinitionType,
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    bool IncludeDeleted = false) : IRequest<PagedResponse<DefinitionRecordDto>>;

public sealed class GetDefinitionsPagedQueryHandler : IRequestHandler<GetDefinitionsPagedQuery, PagedResponse<DefinitionRecordDto>>
{
    private readonly IDefinitionRepository _repository;

    public GetDefinitionsPagedQueryHandler(IDefinitionRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResponse<DefinitionRecordDto>> Handle(GetDefinitionsPagedQuery request, CancellationToken cancellationToken)
    {
        var result = await _repository.GetPagedAsync(request.DefinitionType, request.Page, request.PageSize, request.Search, request.IncludeDeleted, cancellationToken);

        return new PagedResponse<DefinitionRecordDto>(
            result.Items.Select(DefinitionDtoMapper.Map).ToArray(),
            result.Page,
            result.PageSize,
            result.TotalCount);
    }
}
