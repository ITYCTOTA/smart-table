export function initFiltering(elements) {
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
        const value = element.value.trim();

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
