import { test } from "node:test";
import assert from "node:assert/strict";
import { generateSessionCode, slugifyClientName, extractDriveFolderId } from "./utils.ts";

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

test("extractDriveFolderId: format /drive/folders/<id>?usp=sharing", () => {
  assert.equal(
    extractDriveFolderId("https://drive.google.com/drive/folders/1AbCdEfGhIjKlMnOp?usp=sharing"),
    "1AbCdEfGhIjKlMnOp"
  );
});

test("extractDriveFolderId: format /drive/u/0/folders/<id>", () => {
  assert.equal(
    extractDriveFolderId("https://drive.google.com/drive/u/0/folders/1AbCdEfGhIjKlMnOp"),
    "1AbCdEfGhIjKlMnOp"
  );
});

test("extractDriveFolderId: format open?id=<id>", () => {
  assert.equal(
    extractDriveFolderId("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOp"),
    "1AbCdEfGhIjKlMnOp"
  );
});

test("extractDriveFolderId: raw ID tanpa URL", () => {
  assert.equal(extractDriveFolderId("1AbCdEfGhIjKlMnOpQrStUvWxYz"), "1AbCdEfGhIjKlMnOpQrStUvWxYz");
});

test("extractDriveFolderId: input kosong/ngawur → null", () => {
  assert.equal(extractDriveFolderId(""), null);
  assert.equal(extractDriveFolderId("bukan link drive sama sekali"), null);
  assert.equal(extractDriveFolderId("https://google.com"), null);
});
