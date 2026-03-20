export function initSearching(searchField) {
  return (query, state) =>
    state[searchField]
      ? {
          ...query,
          search: state[searchField],
        }
      : query;
}
