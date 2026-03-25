export type QuerySectionItem = {
  queryColumns?: 1 | 2;
};

export const DEFAULT_QUERY_SECTION_MAX_COLUMNS = 12;

function getQuerySectionItemColumns<T>(item: T, getQueryColumns?: (item: T) => number) {
  if (getQueryColumns) {
    return getQueryColumns(item);
  }

  return (item as QuerySectionItem).queryColumns ?? 1;
}

export function getVisibleQuerySectionItems<T>(
  items: T[],
  expanded: boolean,
  maxColumns = DEFAULT_QUERY_SECTION_MAX_COLUMNS,
  getQueryColumns?: (item: T) => number,
) {
  if (expanded) {
    return items;
  }

  const visibleItems: T[] = [];
  let usedColumns = 0;

  items.forEach((item) => {
    const queryColumns = getQuerySectionItemColumns(item, getQueryColumns);
    if (usedColumns + queryColumns > maxColumns) {
      return;
    }

    visibleItems.push(item);
    usedColumns += queryColumns;
  });

  return visibleItems;
}

export function hasCollapsedQuerySectionItems<T>(
  items: T[],
  maxColumns = DEFAULT_QUERY_SECTION_MAX_COLUMNS,
  getQueryColumns?: (item: T) => number,
) {
  return getVisibleQuerySectionItems(items, false, maxColumns, getQueryColumns).length < items.length;
}
