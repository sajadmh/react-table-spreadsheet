/**
 * Flattens cell text into a single spreadsheet-friendly line.
 */
function normalizeCellText(text) {
    return text.replace(/[\t\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
}
/**
 * Reads the default text value to use for copy output.
 */
function defaultGetCellText(cell) {
    const text = cell.innerText ?? cell.textContent ?? "";
    return normalizeCellText(text);
}
/**
 * Builds the stable id used for one logical row.
 */
function getRowId(index) {
    return `row-${index}`;
}
/**
 * Builds the stable id used for one logical column.
 */
function getColumnId(index) {
    return `column-${index}`;
}
/**
 * Ensures the backing grid has a row array at the requested index.
 */
function ensureGridRow(grid, rowIndex) {
    grid[rowIndex] ?? (grid[rowIndex] = []);
    return grid[rowIndex];
}
/**
 * Finds the next free logical column in a grid row.
 */
function getNextAvailableColumn(gridRow, startIndex) {
    let columnIndex = startIndex;
    while (gridRow[columnIndex]) {
        columnIndex += 1;
    }
    return columnIndex;
}
/**
 * Registers every logical coordinate covered by one DOM cell and its spans.
 */
function registerCellAliases(cell, grid, rowSpan, colSpan, copyValue, cellByCoordinate, copyValueByCoordinate) {
    let maxColumnCount = 0;
    for (let rowOffset = 0; rowOffset < rowSpan; rowOffset += 1) {
        const aliasRowIndex = cell.rowIndex + rowOffset;
        const gridRow = ensureGridRow(grid, aliasRowIndex);
        for (let columnOffset = 0; columnOffset < colSpan; columnOffset += 1) {
            const aliasColumnIndex = cell.columnIndex + columnOffset;
            const alias = {
                rowId: getRowId(aliasRowIndex),
                columnId: getColumnId(aliasColumnIndex),
            };
            const coordinateKey = getCoordinateKey(alias.rowId, alias.columnId);
            cell.aliases.push(alias);
            gridRow[aliasColumnIndex] = cell;
            cellByCoordinate.set(coordinateKey, cell);
            copyValueByCoordinate.set(coordinateKey, rowOffset === 0 && columnOffset === 0 ? copyValue : "");
            maxColumnCount = Math.max(maxColumnCount, aliasColumnIndex + 1);
        }
    }
    return maxColumnCount;
}
/**
 * Builds a stable map key for one logical table coordinate.
 */
export function getCoordinateKey(rowId, columnId) {
    return `${rowId}:${columnId}`;
}
/**
 * Builds a logical table model from the current DOM table structure.
 */
export function buildDOMTableModel(table, options = {}) {
    const getCellText = options.getCellText ?? defaultGetCellText;
    const rowElements = Array.from(table.rows);
    const rows = rowElements.map((_, index) => ({ id: getRowId(index) }));
    const grid = [];
    const cells = [];
    const cellByCoordinate = new Map();
    const copyValueByCoordinate = new Map();
    let maxColumnCount = 0;
    rowElements.forEach((rowElement, rowIndex) => {
        const gridRow = ensureGridRow(grid, rowIndex);
        let searchColumnIndex = 0;
        Array.from(rowElement.cells).forEach((cellElement, cellIndex) => {
            const columnIndex = getNextAvailableColumn(gridRow, searchColumnIndex);
            const rowSpan = Math.max(1, cellElement.rowSpan || 1);
            const colSpan = Math.max(1, cellElement.colSpan || 1);
            const cell = {
                id: `cell-${rowIndex}-${columnIndex}-${cellIndex}`,
                rowId: getRowId(rowIndex),
                columnId: getColumnId(columnIndex),
                rowIndex,
                columnIndex,
                element: cellElement,
                aliases: [],
            };
            cells.push(cell);
            const copyValue = getCellText(cellElement);
            maxColumnCount = Math.max(maxColumnCount, registerCellAliases(cell, grid, rowSpan, colSpan, copyValue, cellByCoordinate, copyValueByCoordinate));
            searchColumnIndex = columnIndex + colSpan;
        });
    });
    const columns = Array.from({ length: maxColumnCount }, (_, index) => ({ id: getColumnId(index) }));
    return {
        rows,
        columns,
        cells,
        cellByCoordinate,
        copyValueByCoordinate,
    };
}
//# sourceMappingURL=table-model.js.map