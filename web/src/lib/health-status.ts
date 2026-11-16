interface HealthQueryState {
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly data?: { readonly status: string; readonly service: string };
}

export function getHealthStatus({ isPending, isError, data }: HealthQueryState): {
  state: "pending" | "error" | "ok";
  label: string;
} {
  if (isError) return { state: "error", label: "未连接" };
  if (isPending || !data) return { state: "pending", label: "检查中" };
  return { state: "ok", label: `${data.status} (${data.service})` };
}
