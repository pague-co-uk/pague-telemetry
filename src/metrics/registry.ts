class MetricRegistry<T> {
  private readonly metrics = new Map<string, T>();

  get(name: string): T | undefined {
    return this.metrics.get(name);
  }

  register(name: string, metric: T): T {
    this.metrics.set(name, metric);
    return metric;
  }

  has(name: string): boolean {
    return this.metrics.has(name);
  }

  clear(): void {
    this.metrics.clear();
  }
}