import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import { orpc } from '@/lib/api-client.ts';
import { cn } from '@/lib/cn.ts';

const statusBadge = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs',
  {
    variants: {
      state: {
        pending: 'bg-gray-100 text-gray-600',
        error: 'bg-error-50 text-error-700',
        ok: 'bg-success-50 text-success-700',
      },
    },
    defaultVariants: {
      state: 'pending',
    },
  },
);

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const health = useQuery(orpc.system.health.queryOptions({ input: {} }));
  const state = health.isPending ? 'pending' : health.isError ? 'error' : 'ok';

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-3 px-6">
      <h1 className="font-semibold text-2xl tracking-tight">Web App</h1>
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>后端状态</span>
        <span className={cn(statusBadge({ state }))}>
          {health.isPending
            ? '检查中'
            : health.isError
              ? '未连接'
              : `${health.data.status} (${health.data.service})`}
        </span>
      </div>
    </main>
  );
}
