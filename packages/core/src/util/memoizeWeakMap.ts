export const memoizeWeakMap = <K extends object, V>(fn: (arg: K) => V, cache: WeakMap<K, V> = new WeakMap<K, V>()) => (
  arg: K,
) => {
  if (cache.has(arg)) {
    cache.set(arg, fn(arg));
  }
  return cache.get(arg);
};
