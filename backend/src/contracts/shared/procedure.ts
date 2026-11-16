import { oc } from '@orpc/contract';
import { type } from 'arktype';

export const emptyInput = type({ '+': 'reject' });

export const procedure = oc.errors({
  BAD_REQUEST: { status: 400, message: '请求参数不合法' },
  UNAUTHORIZED: { status: 401, message: '请先登录' },
  FORBIDDEN: { status: 403, message: '无权执行此操作' },
  NOT_FOUND: { status: 404, message: '资源不存在' },
  CONFLICT: { status: 409, message: '资源状态冲突' },
  TOO_MANY_REQUESTS: { status: 429, message: '请求过于频繁' },
  INTERNAL_SERVER_ERROR: { status: 500, message: '服务暂时不可用' },
});
