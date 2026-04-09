"use client";

import * as React from "react";
import type { TableSpreadsheetOptions } from "../dom/enhance-table.js";
import { enhanceTable } from "../dom/enhance-table.js";

export interface TableSteroidsProps extends React.TableHTMLAttributes<HTMLTableElement>, TableSpreadsheetOptions {
  children?: React.ReactNode;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref && typeof ref === "object") {
    (ref as { current: T | null }).current = value;
  }
}

export const TableSteroids = React.forwardRef<HTMLTableElement, TableSteroidsProps>(
  function TableSteroidsWithRef(
    {
      allowCellSelection = true,
      allowRangeSelection = true,
      activationMode,
      observeMutations = true,
      onSelectionCopy,
      onSelectionChange,
      getCellText,
      selectionScope,
      isSelectableCell,
      shouldIgnoreEvent,
      overlay,
      plugins,
      ...tableProps
    },
    forwardedRef,
  ) {
    const tableRef = React.useRef<HTMLTableElement | null>(null);

    React.useEffect(() => {
      const table = tableRef.current;

      if (!(table instanceof HTMLTableElement)) {
        return;
      }

      const handle = enhanceTable(table, {
        allowCellSelection,
        allowRangeSelection,
        activationMode,
        observeMutations,
        onSelectionCopy,
        onSelectionChange,
        getCellText,
        selectionScope,
        isSelectableCell,
        shouldIgnoreEvent,
        overlay,
        plugins,
      });

      return () => {
        handle.destroy();
      };
    }, [
      activationMode,
      allowCellSelection,
      allowRangeSelection,
      getCellText,
      isSelectableCell,
      observeMutations,
      onSelectionChange,
      onSelectionCopy,
      overlay,
      plugins,
      selectionScope,
      shouldIgnoreEvent,
    ]);

    return React.createElement("table", {
      ...tableProps,
      ref: (node: HTMLTableElement | null) => {
        tableRef.current = node;
        assignRef(forwardedRef, node);
      },
    });
  },
);
