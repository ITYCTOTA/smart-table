import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  let pageCount = 1;
  let lastBaseQuery = "";
  let lastLimit = null;

  const applyPagination = (query, state, action) => {
    const limit = state.rowsPerPage;
    let page = state.page;
    const nextBaseQuery = new URLSearchParams(query).toString();
    const isPaginationAction = action && ["prev", "next", "first", "last"].includes(action.name);

    if (isPaginationAction) {
      switch (action.name) {
        case "prev":
          page = Math.max(1, page - 1);
          break;
        case "next":
          page = Math.min(pageCount, page + 1);
          break;
        case "first":
          page = 1;
          break;
        case "last":
          page = pageCount;
          break;
      }
    } else if (lastBaseQuery !== nextBaseQuery || lastLimit !== limit) {
      page = 1;
    }

    lastBaseQuery = nextBaseQuery;
    lastLimit = limit;

    return {
      ...query,
      limit,
      page,
    };
  };

  const updatePagination = (total, { page, limit }) => {
    pageCount = Math.max(1, Math.ceil(total / limit));

    const currentPage = Math.min(page, pageCount);
    const visiblePages = getPages(currentPage, pageCount, 5);

    pages.replaceChildren(
      ...visiblePages.map((pageNumber) => {
        const el = pageTemplate.cloneNode(true);
        return createPage(el, pageNumber, pageNumber === currentPage);
      })
    );

    fromRow.textContent = total ? (currentPage - 1) * limit + 1 : 0;
    toRow.textContent = total ? Math.min(currentPage * limit, total) : 0;
    totalRows.textContent = total;
  };

  return {
    applyPagination,
    updatePagination,
  };
};
