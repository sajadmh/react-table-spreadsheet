import type { CellCoordinates, SelectableItem, Selection, SelectionBounds } from "./types.js";

/**
 * Converts valid selections into numeric bounds and drops any stale ones.
 */
function toSelectionBoundsList(
  selections: Selection[],
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  return selections
    .map((selection) => getSelectionBounds(selection, rowIndexMap, columnIndexMap))
    .filter((bounds): bounds is SelectionBounds => bounds !== null);
}

/**
 * Checks whether one rectangular bounds fully contains another.
 */
function containsBounds(container: SelectionBounds, candidate: SelectionBounds) {
  return (
    candidate.minRow >= container.minRow &&
    candidate.maxRow <= container.maxRow &&
    candidate.minColumn >= container.minColumn &&
    candidate.maxColumn <= container.maxColumn
  );
}

/**
 * Checks whether a single cell index falls inside rectangular bounds.
 */
function containsCell(bounds: SelectionBounds, rowIndex: number, columnIndex: number) {
  return (
    rowIndex >= bounds.minRow &&
    rowIndex <= bounds.maxRow &&
    columnIndex >= bounds.minColumn &&
    columnIndex <= bounds.maxColumn
  );
}

/**
 * Builds a quick lookup from item id to its current index.
 */
export function buildIndexMap(items: SelectableItem[]) {
  const indexMap: Record<string, number> = {};

  items.forEach((item, index) => {
    indexMap[item.id] = index;
  });

  return indexMap;
}

/**
 * Converts a selection from ids into numeric rectangular bounds.
 */
export function getSelectionBounds(
  selection: Selection,
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
): SelectionBounds | null {
  const startRowIndex = rowIndexMap[selection.start.rowId];
  const endRowIndex = rowIndexMap[selection.end.rowId];
  const startColumnIndex = columnIndexMap[selection.start.columnId];
  const endColumnIndex = columnIndexMap[selection.end.columnId];

  if (
    startRowIndex === undefined ||
    endRowIndex === undefined ||
    startColumnIndex === undefined ||
    endColumnIndex === undefined
  ) {
    return null;
  }

  return {
    minRow: Math.min(startRowIndex, endRowIndex),
    maxRow: Math.max(startRowIndex, endRowIndex),
    minColumn: Math.min(startColumnIndex, endColumnIndex),
    maxColumn: Math.max(startColumnIndex, endColumnIndex),
  };
}

/**
 * Converts numeric bounds back into a selection using the current rows and columns.
 */
export function boundsToSelection(bounds: SelectionBounds, rows: SelectableItem[], columns: SelectableItem[]): Selection | null {
  const startRow = rows[bounds.minRow];
  const endRow = rows[bounds.maxRow];
  const startColumn = columns[bounds.minColumn];
  const endColumn = columns[bounds.maxColumn];

  if (!startRow || !endRow || !startColumn || !endColumn) {
    return null;
  }

  return {
    start: {
      rowId: startRow.id,
      columnId: startColumn.id,
    },
    end: {
      rowId: endRow.id,
      columnId: endColumn.id,
    },
  };
}

/**
 * Returns how many cells are covered by rectangular bounds.
 */
export function getBoundsArea(bounds: SelectionBounds) {
  return (bounds.maxRow - bounds.minRow + 1) * (bounds.maxColumn - bounds.minColumn + 1);
}

/**
 * Returns how many cells two rectangular bounds share.
 */
export function getOverlapArea(a: SelectionBounds, b: SelectionBounds) {
  const overlapWidth = Math.max(0, Math.min(a.maxColumn, b.maxColumn) - Math.max(a.minColumn, b.minColumn) + 1);
  const overlapHeight = Math.max(0, Math.min(a.maxRow, b.maxRow) - Math.max(a.minRow, b.minRow) + 1);
  return overlapWidth * overlapHeight;
}

/**
 * Builds the smallest rectangle that contains every bounds in the list.
 */
export function getBoundingBounds(boundsList: SelectionBounds[]): SelectionBounds {
  return boundsList.reduce(
    (acc, bounds) => ({
      minRow: Math.min(acc.minRow, bounds.minRow),
      maxRow: Math.max(acc.maxRow, bounds.maxRow),
      minColumn: Math.min(acc.minColumn, bounds.minColumn),
      maxColumn: Math.max(acc.maxColumn, bounds.maxColumn),
    }),
    { ...boundsList[0] },
  );
}

/**
 * Checks whether two bounds can be combined into one rectangle without changing covered cells.
 */
export function canMergeBounds(a: SelectionBounds, b: SelectionBounds) {
  const mergedBounds = getBoundingBounds([a, b]);
  const mergedArea = getBoundsArea(mergedBounds);
  const unionArea = getBoundsArea(a) + getBoundsArea(b) - getOverlapArea(a, b);
  return mergedArea === unionArea;
}

/**
 * Merges adjacent or overlapping selections into the simplest rectangular set.
 */
export function normalizeSelections(
  selections: Selection[],
  rows: SelectableItem[],
  columns: SelectableItem[],
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  const normalizedBounds = toSelectionBoundsList(selections, rowIndexMap, columnIndexMap);

  let didMerge = true;

  while (didMerge) {
    didMerge = false;

    for (let index = 0; index < normalizedBounds.length; index += 1) {
      for (let candidateIndex = index + 1; candidateIndex < normalizedBounds.length; candidateIndex += 1) {
        const currentBounds = normalizedBounds[index];
        const candidateBounds = normalizedBounds[candidateIndex];

        if (!canMergeBounds(currentBounds, candidateBounds)) {
          continue;
        }

        normalizedBounds[index] = getBoundingBounds([currentBounds, candidateBounds]);
        normalizedBounds.splice(candidateIndex, 1);
        didMerge = true;
        break;
      }

      if (didMerge) {
        break;
      }
    }
  }

  return normalizedBounds
    .map((bounds) => boundsToSelection(bounds, rows, columns))
    .filter((selection): selection is Selection => selection !== null);
}

/**
 * Picks the active selection that still matches the normalized selection set.
 */
export function resolveActiveSelection(
  selections: Selection[],
  activeSelection: Selection | null,
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  const lastSelection = selections.length > 0 ? selections[selections.length - 1] : null;

  if (!activeSelection) {
    return null;
  }

  const activeBounds = getSelectionBounds(activeSelection, rowIndexMap, columnIndexMap);

  if (!activeBounds) {
    return lastSelection;
  }

  return (
    selections.find((selection) => {
      const bounds = getSelectionBounds(selection, rowIndexMap, columnIndexMap);

      if (!bounds) {
        return false;
      }

      return containsBounds(bounds, activeBounds);
    }) ??
    lastSelection ??
    null
  );
}

/**
 * Checks whether two rectangles overlap at all.
 */
export function intersects(a: SelectionBounds, b: SelectionBounds) {
  return !(a.maxRow < b.minRow || a.minRow > b.maxRow || a.maxColumn < b.minColumn || a.minColumn > b.maxColumn);
}

/**
 * Removes one rectangular area from another and returns the remaining rectangles.
 */
export function subtractBounds(base: SelectionBounds, cut: SelectionBounds): SelectionBounds[] {
  if (!intersects(base, cut)) {
    return [base];
  }

  const overlapMinRow = Math.max(base.minRow, cut.minRow);
  const overlapMaxRow = Math.min(base.maxRow, cut.maxRow);
  const overlapMinColumn = Math.max(base.minColumn, cut.minColumn);
  const overlapMaxColumn = Math.min(base.maxColumn, cut.maxColumn);
  const nextBounds: SelectionBounds[] = [];

  if (base.minRow < overlapMinRow) {
    nextBounds.push({
      minRow: base.minRow,
      maxRow: overlapMinRow - 1,
      minColumn: base.minColumn,
      maxColumn: base.maxColumn,
    });
  }

  if (overlapMaxRow < base.maxRow) {
    nextBounds.push({
      minRow: overlapMaxRow + 1,
      maxRow: base.maxRow,
      minColumn: base.minColumn,
      maxColumn: base.maxColumn,
    });
  }

  if (base.minColumn < overlapMinColumn) {
    nextBounds.push({
      minRow: overlapMinRow,
      maxRow: overlapMaxRow,
      minColumn: base.minColumn,
      maxColumn: overlapMinColumn - 1,
    });
  }

  if (overlapMaxColumn < base.maxColumn) {
    nextBounds.push({
      minRow: overlapMinRow,
      maxRow: overlapMaxRow,
      minColumn: overlapMaxColumn + 1,
      maxColumn: base.maxColumn,
    });
  }

  return nextBounds;
}

/**
 * Removes a selection from the current selection set.
 */
export function subtractSelection(
  selections: Selection[],
  cut: Selection,
  rows: SelectableItem[],
  columns: SelectableItem[],
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  const cutBounds = getSelectionBounds(cut, rowIndexMap, columnIndexMap);

  if (!cutBounds) {
    return selections;
  }

  return selections.flatMap((selection) => {
    const selectionBounds = getSelectionBounds(selection, rowIndexMap, columnIndexMap);

    if (!selectionBounds) {
      return [];
    }

    return subtractBounds(selectionBounds, cutBounds)
      .map((bounds) => boundsToSelection(bounds, rows, columns))
      .filter((nextSelection): nextSelection is Selection => nextSelection !== null);
  });
}

/**
 * Checks whether a specific cell is covered by any current selection.
 */
export function isCellSelected(
  rowId: string,
  columnId: string,
  selections: Selection[],
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  const rowIndex = rowIndexMap[rowId];
  const columnIndex = columnIndexMap[columnId];

  if (rowIndex === undefined || columnIndex === undefined) {
    return false;
  }

  return selections.some((selection) => {
    const bounds = getSelectionBounds(selection, rowIndexMap, columnIndexMap);

    if (!bounds) {
      return false;
    }

    return containsCell(bounds, rowIndex, columnIndex);
  });
}

/**
 * Produces a stable string key for a selection.
 */
export function getSelectionKey(selection?: Selection | null) {
  if (!selection) {
    return "selection:unknown";
  }

  return `${selection.start.rowId}:${selection.start.columnId}:${selection.end.rowId}:${selection.end.columnId}`;
}

/**
 * Produces a stable string key for one cell coordinate.
 */
export function toCoordinateKey(coordinates: CellCoordinates) {
  return `${coordinates.rowId}:${coordinates.columnId}`;
}
