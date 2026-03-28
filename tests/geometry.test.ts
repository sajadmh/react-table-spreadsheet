import assert from "node:assert/strict";
import test from "node:test";

import { buildIndexMap, getSelectionBounds, normalizeSelections, subtractSelection } from "../dist/core.js";
import type { Selection, SelectionBounds } from "../dist/core.d.ts";

const rows = [{ id: "r0" }, { id: "r1" }, { id: "r2" }];
const columns = [{ id: "c0" }, { id: "c1" }, { id: "c2" }];
const rowIndexMap = buildIndexMap(rows);
const columnIndexMap = buildIndexMap(columns);

function toBoundsList(selections: Selection[]) {
  return selections
    .map((selection) => getSelectionBounds(selection, rowIndexMap, columnIndexMap))
    .filter((bounds): bounds is SelectionBounds => bounds !== null)
    .sort((left, right) => {
      if (left.minRow !== right.minRow) {
        return left.minRow - right.minRow;
      }

      if (left.minColumn !== right.minColumn) {
        return left.minColumn - right.minColumn;
      }

      if (left.maxRow !== right.maxRow) {
        return left.maxRow - right.maxRow;
      }

      return left.maxColumn - right.maxColumn;
    });
}

test("normalizeSelections merges adjacent rectangular ranges", () => {
  const normalizedSelections = normalizeSelections(
    [
      {
        start: { rowId: "r0", columnId: "c0" },
        end: { rowId: "r1", columnId: "c0" },
      },
      {
        start: { rowId: "r0", columnId: "c1" },
        end: { rowId: "r1", columnId: "c1" },
      },
    ],
    rows,
    columns,
    rowIndexMap,
    columnIndexMap,
  );

  assert.deepEqual(toBoundsList(normalizedSelections), [
    {
      minRow: 0,
      maxRow: 1,
      minColumn: 0,
      maxColumn: 1,
    },
  ]);
});

test("subtractSelection splits a punched-out middle cell into four surviving rectangles", () => {
  const remainingSelections = subtractSelection(
    [
      {
        start: { rowId: "r0", columnId: "c0" },
        end: { rowId: "r2", columnId: "c2" },
      },
    ],
    {
      start: { rowId: "r1", columnId: "c1" },
      end: { rowId: "r1", columnId: "c1" },
    },
    rows,
    columns,
    rowIndexMap,
    columnIndexMap,
  );

  assert.deepEqual(toBoundsList(remainingSelections), [
    {
      minRow: 0,
      maxRow: 0,
      minColumn: 0,
      maxColumn: 2,
    },
    {
      minRow: 1,
      maxRow: 1,
      minColumn: 0,
      maxColumn: 0,
    },
    {
      minRow: 1,
      maxRow: 1,
      minColumn: 2,
      maxColumn: 2,
    },
    {
      minRow: 2,
      maxRow: 2,
      minColumn: 0,
      maxColumn: 2,
    },
  ]);
});
