export type BackendResponse<T> = {
  ok: boolean;
  data: T;
  errors: string[];
};
