export function initFiltering(elements) {
  const normalizeDateFilter = (value) => {
    const chars = value.trim().replace(/[^0-9*]/g, "");

    if (!chars) {
      return "";
    }

    const mask = Array(8).fill("*");

    chars
      .slice(0, 8)
      .split("")
      .forEach((char, index) => {
        mask[index] = char;
      });

    return `${mask.slice(0, 4).join("")}-${mask.slice(4, 6).join("")}-${mask.slice(6, 8).join("")}`;
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
