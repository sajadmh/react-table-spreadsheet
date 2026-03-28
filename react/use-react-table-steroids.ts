"use client";

import * as React from "react";
import { enhanceTable, type TableSpreadsheetHandle, type TableSpreadsheetOptions } from "../dom/enhance-table.js";

export function useReactTableSteroids(
  tableRef: React.RefObject<HTMLTableElement | null>,
  options: TableSpreadsheetOptions = {},
) {
  const handleRef = React.useRef<TableSpreadsheetHandle | null>(null);
  const {
    allowCellSelection = true,
    allowRangeSelection = true,
    observeMutations = true,
    onSelectionCopy,
    onSelectionChange,
    getCellText,
    overlay,
  } = options;

  React.useEffect(() => {
    const table = tableRef.current;

    if (!table) {
      return;
    }

    const handle = enhanceTable(table, {
      allowCellSelection,
      allowRangeSelection,
      observeMutations,
      onSelectionCopy,
      onSelectionChange,
      getCellText,
      overlay,
    });

    handleRef.current = handle;

    return () => {
      handle.destroy();

      if (handleRef.current === handle) {
        handleRef.current = null;
      }
    };
  }, [allowCellSelection, allowRangeSelection, getCellText, observeMutations, onSelectionChange, onSelectionCopy, overlay, tableRef]);

  return handleRef;
}
