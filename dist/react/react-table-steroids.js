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
export const TableSteroids = React.forwardRef(function TableSteroidsWithRef({ allowCellSelection = true, allowRangeSelection = true, activationMode, observeMutations = true, onSelectionCopy, onSelectionChange, getCellText, selectionScope, isSelectableCell, shouldIgnoreEvent, overlay, plugins, ...tableProps }, forwardedRef) {
    const tableRef = React.useRef(null);
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
        ref: (node) => {
            tableRef.current = node;
            assignRef(forwardedRef, node);
        },
    });
});
//# sourceMappingURL=react-table-steroids.js.map