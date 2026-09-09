import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSessionCode, slugifyClientName } from "./utils.ts";

test("generateSessionCode: panjang default 6 karakter", () => {
  const code = generateSessionCode();
  assert.equal(code.length, 6);
});

test("generateSessionCode: tidak mengandung karakter ambigu (0,O,1,I,L)", () => {
  const code = generateSessionCode(200);
  assert.ok(!/[0O1IL]/.test(code), `kode mengandung karakter ambigu: ${code}`);
});

test("generateSessionCode: menghormati panjang custom", () => {
  assert.equal(generateSessionCode(10).length, 10);
});

test("slugifyClientName: konversi ke slug lowercase-hyphen", () => {
  assert.equal(slugifyClientName("Budi & Sari  Wedding"), "budi-sari-wedding");
});

test("slugifyClientName: trim tanda hubung di ujung", () => {
  assert.equal(slugifyClientName("  --Foto Keluarga--  "), "foto-keluarga");
});
