import assert from "node:assert/strict";
import test from "node:test";

import { copySelectionToText, resolveCopySelection, restoreSelectionState, snapshotSelectionState } from "../dist/core.js";
import type { Selection } from "../dist/core.d.ts";

const rows = [{ id: "r0" }, { id: "r1" }, { id: "r2" }];
const columns = [{ id: "c0" }, { id: "c1" }, { id: "c2" }, { id: "c3" }];

test("resolveCopySelection returns horizontal mode for aligned multi-ranges", () => {
  const selections: Selection[] = [
    {
      start: { rowId: "r0", columnId: "c0" },
      end: { rowId: "r1", columnId: "c1" },
    },
    {
      start: { rowId: "r0", columnId: "c2" },
      end: { rowId: "r1", columnId: "c3" },
    },
  ];

  const plan = resolveCopySelection(selections, selections[1], rows, columns);

  assert.deepEqual(plan, {
    mode: "horizontal",
    selections,
  });
});

test("resolveCopySelection falls back to the active range for irregular selections", () => {
  const selections: Selection[] = [
    {
      start: { rowId: "r0", columnId: "c0" },
      end: { rowId: "r1", columnId: "c1" },
    },
    {
      start: { rowId: "r1", columnId: "c2" },
      end: { rowId: "r2", columnId: "c3" },
    },
  ];

  const plan = resolveCopySelection(selections, selections[1], rows, columns);

  assert.deepEqual(plan, {
    mode: "single",
    selections: [selections[1]],
  });
});

test("copySelectionToText preserves rectangular row-major output", () => {
  const selection: Selection = {
    start: { rowId: "r0", columnId: "c1" },
    end: { rowId: "r1", columnId: "c2" },
  };

  const text = copySelectionToText(
    {
      mode: "single",
      selections: [selection],
    },
    rows,
    columns,
    (rowId, columnId) => `${rowId}-${columnId}`,
  );

  assert.equal(text, "r0-c1\tr0-c2\nr1-c1\tr1-c2");
});

test("restoreSelectionState preserves and clamps selections after table dimensions change", () => {
  const activeSelection: Selection = {
    start: { rowId: "r1", columnId: "c1" },
    end: { rowId: "r2", columnId: "c3" },
  };

  const snapshot = snapshotSelectionState([activeSelection], activeSelection, rows, columns);
  const restored = restoreSelectionState(snapshot, [{ id: "r0" }, { id: "r1" }], [{ id: "c0" }, { id: "c1" }]);

  assert.deepEqual(restored, {
    selections: [
      {
        start: { rowId: "r1", columnId: "c1" },
        end: { rowId: "r1", columnId: "c1" },
      },
    ],
    activeSelection: {
      start: { rowId: "r1", columnId: "c1" },
      end: { rowId: "r1", columnId: "c1" },
    },
  });
});
