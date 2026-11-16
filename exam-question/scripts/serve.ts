import { serve, file } from 'bun'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const { default: app } = await import(pathToFileURL(resolve('dist/server/server.js')).href)
const server = serve({
  hostname: '127.0.0.1',
  idleTimeout: 120,
  port: Number(process.env.PORT ?? 3006),
  async fetch(request) {
    const pathname = new URL(request.url).pathname
    if (pathname.startsWith('/assets/')) {
      if (!/^\/assets\/[\w.-]+$/.test(pathname)) return new Response('Not found', { status: 404 })
      const asset = file(resolve('dist/client', pathname.slice(1)))
      if (!(await asset.exists())) return new Response('Not found', { status: 404 })
      return new Response(asset, {
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      })
    }
    return app.fetch(request)
  },
})
console.log(`面试题库：http://${server.hostname}:${server.port}`)
