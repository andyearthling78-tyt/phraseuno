export const REMINDER_ID = "phraseuno.daily";
type Request = { enabled: boolean; time: string; language: "de" | "en" };
type Adapter = {
  cancel: () => Promise<void>;
  allowed: () => Promise<boolean>;
  schedule: (request: Request) => Promise<void>;
};
export function createReminderQueue(adapter: Adapter) {
  let pending = Promise.resolve<unknown>(undefined);
  return (request: Request): Promise<"off" | "scheduled" | "blocked"> => {
    const task = pending.then(async () => {
      await adapter.cancel();
      if (!request.enabled) return "off" as const;
      if (!await adapter.allowed()) return "blocked" as const;
      await adapter.schedule(request);
      return "scheduled" as const;
    });
    pending = task.catch(() => {});
    return task;
  };
}
