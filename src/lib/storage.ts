type StorageAdapter = {
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
// Serialize saves and deletion so an older pending write cannot restore deleted data.
export function createStorageQueue(adapter: StorageAdapter, key: string) {
  let pending = Promise.resolve();
  function run(task: () => Promise<void>) {
    const result = pending.then(task);
    pending = result.catch(() => {});
    return result;
  }
  return {
    save: (value: string) => run(() => adapter.setItem(key, value)),
    clear: () => run(() => adapter.removeItem(key)),
  };
}
