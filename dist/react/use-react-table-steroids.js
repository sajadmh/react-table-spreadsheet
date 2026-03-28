"use client";
import * as React from "react";
import { enhanceTable } from "../dom/enhance-table.js";
export function useReactTableSteroids(tableRef, options = {}) {
    const handleRef = React.useRef(null);
    const { allowCellSelection = true, allowRangeSelection = true, observeMutations = true, onSelectionCopy, onSelectionChange, getCellText, overlay, } = options;
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
//# sourceMappingURL=use-react-table-steroids.js.map