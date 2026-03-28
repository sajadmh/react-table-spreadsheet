import { getSelectionBounds } from "../core/geometry.js";
import type { CellCoordinates, Selection } from "../core/types.js";

/**
 * Checks whether a coordinate still falls inside resolved selection bounds.
 */
function isCoordinateWithinBounds(
  coordinate: CellCoordinates | null,
  bounds: ReturnType<typeof getSelectionBounds>,
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  if (!coordinate || !bounds) {
    return false;
  }

  const rowIndex = rowIndexMap[coordinate.rowId];
  const columnIndex = columnIndexMap[coordinate.columnId];

  if (rowIndex === undefined || columnIndex === undefined) {
    return false;
  }

  return (
    rowIndex >= bounds.minRow &&
    rowIndex <= bounds.maxRow &&
    columnIndex >= bounds.minColumn &&
    columnIndex <= bounds.maxColumn
  );
}

/**
 * Restores the focused cell and anchor cell for the current active selection.
 */
export function resolveSelectionFocusState(
  activeSelection: Selection | null,
  previousSelectedCell: CellCoordinates | null,
  previousRangeAnchorCell: CellCoordinates | null,
  rowIndexMap: Record<string, number>,
  columnIndexMap: Record<string, number>,
) {
  if (!activeSelection) {
    return {
      selectedCell: null,
      rangeAnchorCell: null,
    };
  }

  const activeBounds = getSelectionBounds(activeSelection, rowIndexMap, columnIndexMap);

  const selectedCell = isCoordinateWithinBounds(previousSelectedCell, activeBounds, rowIndexMap, columnIndexMap)
    ? previousSelectedCell
    : activeSelection.end;

  const rangeAnchorCell = isCoordinateWithinBounds(
    previousRangeAnchorCell,
    activeBounds,
    rowIndexMap,
    columnIndexMap,
  )
    ? previousRangeAnchorCell
    : selectedCell;

  return {
    selectedCell,
    rangeAnchorCell,
  };
}
