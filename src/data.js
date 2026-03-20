const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";

export function initData() {
  let sellers;
  let customers;
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

  const getRecords = async (query, isUpdated = false) => {
    await getIndexes();

    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    if (!response.ok) {
      return {
        total: 0,
        items: [],
      };
    }

    const records = await response.json();

    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  const getRecordsSync = (query, isUpdated = false) => {
    getIndexesSync();

    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();

    if (lastQuery === nextQuery && !isUpdated) {
      return lastResult;
    }

    const records = requestJsonSync(`${BASE_URL}/records?${nextQuery}`);

    if (!records) {
      return {
        total: 0,
        items: [],
      };
    }

    lastQuery = nextQuery;
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  return {
    getIndexes,
    getIndexesSync,
    getRecords,
    getRecordsSync,
  };
}
