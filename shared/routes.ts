import { z } from 'zod';
import { createWorkspaceSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  workspaces: {
    list: {
      method: 'GET' as const,
      path: '/api/workspaces' as const,
      responses: {
        200: z.array(z.custom<any>()), // WorkspaceResponse[]
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/workspaces' as const,
      input: createWorkspaceSchema,
      responses: {
        201: z.custom<any>(), // WorkspaceResponse
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/workspaces/:slug' as const,
      responses: {
        200: z.custom<any>(), // WorkspaceDetailResponse
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    invite: {
      method: 'POST' as const,
      path: '/api/workspaces/:id/invite' as const,
      input: z.object({ email: z.string().email() }),
      responses: {
        201: z.custom<any>(), // WorkspaceMember
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    removeMember: {
      method: 'DELETE' as const,
      path: '/api/workspaces/:id/members/:userId' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
