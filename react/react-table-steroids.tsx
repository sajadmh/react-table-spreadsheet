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
      observeMutations = true,
      onSelectionCopy,
      onSelectionChange,
      getCellText,
      overlay,
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
        observeMutations,
        onSelectionCopy,
        onSelectionChange,
        getCellText,
        overlay,
      });

      return () => {
        handle.destroy();
      };
    }, [allowCellSelection, allowRangeSelection, getCellText, observeMutations, onSelectionChange, onSelectionCopy, overlay]);

    return React.createElement("table", {
      ...tableProps,
      ref: (node: HTMLTableElement | null) => {
        tableRef.current = node;
        assignRef(forwardedRef, node);
      },
    });
  },
);
