export const memoizeMap = <K, V>(fn: (arg: K) => V, cache: Map<K, V> = new Map<K, V>()) => (arg: K) => {
  if (cache.has(arg)) {
    cache.set(arg, fn(arg));
  }
  return cache.get(arg);
};
