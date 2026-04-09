import assert from "node:assert/strict";
import test from "node:test";

import { buildDOMTableModel } from "../dist/dom.js";

test("buildDOMTableModel can scope logical selection rows to tbody only", () => {
  const headerCell = {
    rowSpan: 1,
    colSpan: 1,
    innerText: "Header",
    textContent: "Header",
  };
  const bodyCell = {
    rowSpan: 1,
    colSpan: 1,
    innerText: "Body",
    textContent: "Body",
  };
  const theadRow = { cells: [headerCell] };
  const tbodyRow = { cells: [bodyCell] };
  const table = {
    rows: [theadRow, tbodyRow],
    tBodies: [{ rows: [tbodyRow] }],
  } as never;

  const model = buildDOMTableModel(table, { selectionScope: "tbody" });

  assert.equal(model.rows.length, 1);
  assert.equal(model.cells.length, 1);
  assert.equal(model.cells[0]?.element, bodyCell);
  assert.equal(model.copyValueByCoordinate.get("row-0:column-0"), "Body");
});
