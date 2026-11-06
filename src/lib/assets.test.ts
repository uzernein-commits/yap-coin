import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);

test("the frog image is a lowercase jpeg on disk and in the page", () => {
  const page = readFileSync(new URL("./src/app/page.tsx", root), "utf8");
  assert.match(page, /const FROG_IMAGE_SRC = "\/yap-frog\.jpg"/);
  assert.doesNotMatch(page, /yap-frog\.PNG|yappy\.jfif|\.PNG/);

  const names = readdirSync(new URL("./public", root));
  assert.equal(names.includes("yap-frog.jpg"), true);
  assert.equal(names.includes("yappy.jfif"), false);
  for (const name of names) {
    assert.equal(name, name.toLowerCase());
    assert.equal(name.endsWith(".jfif"), false);
  }

  const bytes = readFileSync(new URL("./public/yap-frog.jpg", root));
  assert.equal(bytes.subarray(0, 3).toString("hex"), "ffd8ff");
});
