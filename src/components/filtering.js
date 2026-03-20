export function initFiltering(elements) {
  const normalizeDateFilter = (value) => {
    const raw = value.trim();

    if (!raw) {
      return "";
    }

    if (raw.includes("-")) {
      const [year = "", month = "", day = ""] = raw.split("-");
      const normalizedYear = (year + "****").slice(0, 4).replace(/\s/g, "*");
      const normalizedMonth = (month + "**").slice(0, 2).replace(/\s/g, "*");
      const normalizedDay = (day + "**").slice(0, 2).replace(/\s/g, "*");
      return `${normalizedYear}-${normalizedMonth}-${normalizedDay}`;
    }

    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      return "";
    }

    if (digits.length <= 2) {
      const month = (digits + "**").slice(0, 2);
      return `****-${month}-**`;
    }

    const year = (digits + "****").slice(0, 4);
    return `${year}-**-**`;
  };

  const updateIndexes = (indexes) => {
    Object.keys(indexes).forEach((elementName) => {
      const element = elements[elementName];

      if (!element) {
        return;
      }

      element.append(
        ...Object.values(indexes[elementName]).map((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = name;
          return option;
        })
      );
    });
  };

  const applyFiltering = (query, state, action) => {
    if (action && action.name === "clear") {
      const fieldName = action.dataset.field;
      const input = action.parentElement.querySelector("input");

      if (input) {
        input.value = "";
      }

      state[fieldName] = "";
    }

    const filter = {};

    Object.keys(elements).forEach((key) => {
      const element = elements[key];

      if (!element) {
        return;
      }

      if (["INPUT", "SELECT"].includes(element.tagName) && element.value) {
        const value =
          element.name === "date" ? normalizeDateFilter(element.value) : element.value.trim();

        if (value) {
          filter[`filter[${element.name}]`] = value;
        }
      }
    });

    return Object.keys(filter).length ? { ...query, ...filter } : query;
  };

  return {
    updateIndexes,
    applyFiltering,
  };
}
