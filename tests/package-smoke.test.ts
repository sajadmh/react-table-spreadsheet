import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the root package entry loads without react installed", async () => {
  const module = await import("../dist/index.js");

  assert.equal(typeof module.enhanceTable, "function");
  assert.equal(typeof module.copySelectionToText, "function");
});

test("the browser assets are generated during build", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  };
  const browserBundle = await readFile(new URL("../dist/browser.js", import.meta.url), "utf8");
  const bookmarklet = await readFile(new URL("../dist/bookmarklet.txt", import.meta.url), "utf8");
  const inlineBookmarklet = await readFile(new URL("../dist/bookmarklet.inline.txt", import.meta.url), "utf8");
  const bookmarkletLoader = await readFile(new URL("../dist/bookmarklet-loader.js", import.meta.url), "utf8");
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(browserBundle, /TableSteroids/);
  assert.match(bookmarklet, /^javascript:/);
  assert.match(bookmarklet, /Enabling table steroids/);
  assert.match(bookmarklet, /Failed to load table steroids/);
  assert.match(bookmarklet, /table-steroids-bookmarklet-toast/);
  assert.match(bookmarklet, /cdn\.jsdelivr\.net\/npm\/table-steroids\/dist\/bookmarklet-loader\.js/);
  assert.match(inlineBookmarklet, /^javascript:/);
  assert.match(inlineBookmarklet, /TableSteroids/);
  assert.match(inlineBookmarklet, /Table steroids enabled/);
  assert.match(inlineBookmarklet, new RegExp(`v${packageJson.version}`));
  assert.doesNotMatch(inlineBookmarklet.trim(), /[\r\n]/);
  assert.doesNotMatch(inlineBookmarklet, / {2,}/);
  await assert.rejects(readFile(new URL("../dist/bookmarklet.github.txt", import.meta.url), "utf8"), { code: "ENOENT" });
  assert.match(readme, /For app developers/);
  assert.match(readme, /For non-developers/);
  assert.match(readme, /Most README renderers disable `javascript:` bookmarklet links/);
  assert.match(readme, /Paste this into the bookmark URL or location field/);
  assert.match(readme, /dist\/bookmarklet\.inline\.txt/);
  assert.match(bookmarkletLoader, /Table steroids enabled/);
  assert.match(bookmarkletLoader, /Table steroids disabled/);
  assert.match(bookmarkletLoader, new RegExp(`v${packageJson.version}`));
  assert.match(bookmarkletLoader, /version\.style\.color="rgba\(255,255,255,0\.65\)"/);
  assert.match(bookmarkletLoader, /toast\.append\(label,version\)/);
  assert.match(bookmarkletLoader, /table-steroids-bookmarklet-toast/);
  assert.match(bookmarkletLoader, /5000/);
});
