export interface CellCoordinates {
  rowId: string;
  columnId: string;
}

export interface Selection {
  start: CellCoordinates;
  end: CellCoordinates;
}

export interface SelectableItem {
  id: string;
}

export interface SelectionBounds {
  minRow: number;
  maxRow: number;
  minColumn: number;
  maxColumn: number;
}
