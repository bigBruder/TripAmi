export interface ZustandDefaultStore<T = unknown> {
  loading?: boolean;
  error?: null | string;
  state?: T;
}
