/**
 * Defers construction of an integration's metric instruments until they are
 * first used. The created bundle is retained for the life of the process.
 */
export function createLazyMetricBundle<T>(
  factory: () => T,
): () => T {
  let bundle: T | undefined;

  return (): T => {
    if (!bundle) {
      bundle = factory();
    }

    return bundle;
  };
}
