import assert from "node:assert/strict";
import test from "node:test";

import { buildDOMTableModel } from "../dist/dom.js";

test("buildDOMTableModel collapses multi-line cell text for spreadsheet-friendly plain-text copying", () => {
  const table = {
    rows: [
      {
        cells: [
          {
            rowSpan: 1,
            colSpan: 1,
            innerText: "20 GB-hours/month\nStarter only: then $0.33 per GB-hour",
            textContent: "20 GB-hours/month\nStarter only: then $0.33 per GB-hour",
          },
        ],
      },
    ],
  } as never;

  const model = buildDOMTableModel(table);

  assert.equal(
    model.copyValueByCoordinate.get("row-0:column-0"),
    "20 GB-hours/month Starter only: then $0.33 per GB-hour",
  );
});
