"use client";
import * as React from "react";
import { enhanceTable } from "../dom/enhance-table.js";
function assignRef(ref, value) {
    if (typeof ref === "function") {
        ref(value);
        return;
    }
    if (ref && typeof ref === "object") {
        ref.current = value;
    }
}
export const TableSteroids = React.forwardRef(function TableSteroidsWithRef({ allowCellSelection = true, allowRangeSelection = true, observeMutations = true, onSelectionCopy, onSelectionChange, getCellText, overlay, ...tableProps }, forwardedRef) {
    const tableRef = React.useRef(null);
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
        ref: (node) => {
            tableRef.current = node;
            assignRef(forwardedRef, node);
        },
    });
});
//# sourceMappingURL=react-table-steroids.js.map