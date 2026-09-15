const pending = new Map<string, Promise<unknown>>();
const results = new Map<string, { value: unknown; expires: number }>();
/** Memory only. Callers include the account and complete recipe/pantry context. */
export function reuseSubstitution(key: string, run: () => Promise<unknown>): Promise<unknown> {
  const cached = results.get(key);
  if (cached && cached.expires > Date.now()) return Promise.resolve(cached.value);
  results.delete(key);
  const running = pending.get(key);
  if (running) return running;
  const operation = Promise.resolve().then(run).then(value => {
    if (results.size >= 30) results.delete(results.keys().next().value!);
    results.set(key, { value, expires: Date.now() + 5 * 60_000 });
    return value;
  }).finally(() => pending.delete(key));
  pending.set(key, operation);
  return operation;
}
