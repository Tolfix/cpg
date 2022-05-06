export default function AW<P>(data: P extends Promise<P> ? Promise<P> : P): Promise<[P | null, PromiseRejectedResult | null]>;
