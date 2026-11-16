import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { cva } from "class-variance-authority";
import { orpc } from "@/lib/api-client.ts";
import { cn } from "@/lib/cn.ts";
import { getHealthStatus } from "@/lib/health-status.ts";

const statusBadge = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      state: {
        pending: "bg-gray-100 text-gray-600",
        error: "bg-error-50 text-error-700",
        ok: "bg-success-50 text-success-700",
      },
    },
    defaultVariants: { state: "pending" },
  }
);

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  const health = useQuery(orpc.system.health.queryOptions({ input: {} }));
  const { state, label } = getHealthStatus(health);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-3 px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Web App</h1>
      <div className="text-text-muted flex flex-wrap items-center gap-2 text-sm">
        <span>后端状态</span>
        <span className={cn(statusBadge({ state }))}>{label}</span>
      </div>
      <span role="status" aria-atomic="true" className="sr-only">
        {state === "pending" ? "" : `后端状态：${label}`}
      </span>
    </main>
  );
}
