const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
  let sellers;
  let customers;
  let records;
  let lastResult;
  let lastQuery;

  const requestJsonSync = (url) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send();

    if (request.status < 200 || request.status >= 300) {
      return null;
    }

    return JSON.parse(request.responseText);
  };

  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  const getIndexes = async () => {
    if (!sellers || !customers) {
      [sellers, customers] = await Promise.all([
        fetch(`${BASE_URL}/sellers`).then((response) => response.json()),
        fetch(`${BASE_URL}/customers`).then((response) => response.json()),
      ]);
    }

    return { sellers, customers };
  };

  const getIndexesSync = () => {
    if (!sellers || !customers) {
      sellers = requestJsonSync(`${BASE_URL}/sellers`);
      customers = requestJsonSync(`${BASE_URL}/customers`);
    }

    return { sellers, customers };
  };

  const getAllRecords = async () => {
    if (!records) {
      await getIndexes();

      const response = await fetch(`${BASE_URL}/records?limit=1000&page=1`);
      if (!response.ok) {
        records = [];
      } else {
        const data = await response.json();
        records = mapRecords(data.items);
      }
    }

    return records;
  };

  const getAllRecordsSync = () => {
    if (!records) {
      getIndexesSync();

      const data = requestJsonSync(`${BASE_URL}/records?limit=1000&page=1`);
      records = data ? mapRecords(data.items) : [];
    }

    return records;
  };

  const filterBySearch = (items, search) => {
    const query = search.toLowerCase();

    return items.filter((item) =>
      [item.date, item.customer, item.seller].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  };

  const filterByFields = (items, query) => {
    let nextItems = items;

    const date = query["filter[date]"];
    if (date) {
      nextItems = nextItems.filter((item) => item.date.includes(date));
    }

    const customer = query["filter[customer]"];
    if (customer) {
      const value = customer.toLowerCase();
      nextItems = nextItems.filter((item) => item.customer.toLowerCase().includes(value));
    }

    const seller = query["filter[seller]"];
    if (seller) {
      nextItems = nextItems.filter((item) => item.seller === seller);
    }

    const totalFrom = query["filter[totalFrom]"];
    if (totalFrom) {
      const min = Number(totalFrom);
      nextItems = nextItems.filter((item) => item.total >= min);
    }

    const totalTo = query["filter[totalTo]"];
    if (totalTo) {
      const max = Number(totalTo);
      nextItems = nextItems.filter((item) => item.total <= max);
    }

    return nextItems;
  };

  const sortRecords = (items, sort) => {
    if (!sort) {
      return items;
    }

    const [field, order] = sort.split(":");
    const direction = order === "down" ? -1 : 1;

    return [...items].sort((left, right) => {
      if (left[field] > right[field]) {
        return direction;
      }

      if (left[field] < right[field]) {
        return -direction;
      }

      return 0;
    });
  };

  const applyQuery = (items, query) => {
    let nextItems = [...items];

    if (query.search) {
      nextItems = filterBySearch(nextItems, query.search);
    }

    nextItems = filterByFields(nextItems, query);
    nextItems = sortRecords(nextItems, query.sort);

    const total = nextItems.length;
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    return {
      total,
      items: nextItems.slice(skip, skip + limit),
    };
  };

  const getRecords = async (query, isUpdated = false) => {
    const allRecords = await getAllRecords();
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    lastQuery = nextQuery;
    lastResult = applyQuery(allRecords, query);

    return lastResult;
  };

  const getRecordsSync = (query, isUpdated = false) => {
    const allRecords = getAllRecordsSync();
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    lastQuery = nextQuery;
    lastResult = applyQuery(allRecords, query);

    return lastResult;
  };

  return {
    getIndexes,
    getIndexesSync,
    getRecords,
    getRecordsSync,
  };
}
