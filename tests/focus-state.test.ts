import assert from "node:assert/strict";
import test from "node:test";

import { resolveSelectionFocusState } from "../dist/dom/focus-state.js";
import type { Selection } from "../dist/core.d.ts";

const rowIndexMap = {
  r0: 0,
  r1: 1,
  r2: 2,
};

const columnIndexMap = {
  c0: 0,
  c1: 1,
  c2: 2,
};

test("resolveSelectionFocusState preserves a leftward range anchor and active cell", () => {
  const activeSelection: Selection = {
    start: { rowId: "r0", columnId: "c0" },
    end: { rowId: "r2", columnId: "c2" },
  };

  const focusState = resolveSelectionFocusState(
    activeSelection,
    { rowId: "r0", columnId: "c0" },
    { rowId: "r2", columnId: "c2" },
    rowIndexMap,
    columnIndexMap,
  );

  assert.deepEqual(focusState, {
    selectedCell: { rowId: "r0", columnId: "c0" },
    rangeAnchorCell: { rowId: "r2", columnId: "c2" },
  });
});

test("resolveSelectionFocusState falls back when the previous focus is no longer in the active selection", () => {
  const activeSelection: Selection = {
    start: { rowId: "r0", columnId: "c0" },
    end: { rowId: "r2", columnId: "c2" },
  };

  const focusState = resolveSelectionFocusState(
    activeSelection,
    { rowId: "r2", columnId: "c3" },
    { rowId: "r1", columnId: "c1" },
    rowIndexMap,
    columnIndexMap,
  );

  assert.deepEqual(focusState, {
    selectedCell: { rowId: "r2", columnId: "c2" },
    rangeAnchorCell: { rowId: "r1", columnId: "c1" },
  });
});

test("resolveSelectionFocusState clears focus state when there is no active selection", () => {
  const focusState = resolveSelectionFocusState(
    null,
    { rowId: "r0", columnId: "c0" },
    { rowId: "r2", columnId: "c2" },
    rowIndexMap,
    columnIndexMap,
  );

  assert.deepEqual(focusState, {
    selectedCell: null,
    rangeAnchorCell: null,
  });
});
