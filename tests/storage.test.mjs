import test from "node:test";
import assert from "node:assert/strict";
import { createStorageQueue } from "../src/lib/storage.ts";
test("Deletion waits for an older save and cannot be undone by it", async () => {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let stored;
  const order = [];
  const queue = createStorageQueue(
    {
      setItem: async (key, value) => {
        await gate;
        stored = value;
        order.push("save");
      },
      removeItem: async () => {
        stored = undefined;
        order.push("clear");
      },
    },
    "test",
  );
  const save = queue.save("old dialog");
  const clear = queue.clear();
  release();
  await Promise.all([save, clear]);
  assert.equal(stored, undefined);
  assert.deepEqual(order, ["save", "clear"]);
});
test("Storage failures remain visible and do not poison later operations", async () => {
  let calls = 0;
  let stored = "old";
  const queue = createStorageQueue(
    {
      setItem: async (_, value) => {
        stored = value;
      },
      removeItem: async () => {
        if (calls++ === 0) throw new Error("disk failure");
        stored = undefined;
      },
    },
    "test",
  );
  await assert.rejects(queue.clear(), /disk failure/);
  assert.equal(stored, "old");
  await queue.clear();
  assert.equal(stored, undefined);
  await queue.save("fresh");
  assert.equal(stored, "fresh");
});
