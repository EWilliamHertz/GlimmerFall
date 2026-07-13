import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiMiddleware = () => ({
  name: 'api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url?.startsWith('/api/')) {
        try {
          const path = req.url.split('?')[0];
          const modulePath = `.${path}.js`; 
          const { default: handler } = await server.ssrLoadModule(modulePath);
          
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (data) => {
             res.setHeader('Content-Type', 'application/json');
             res.end(JSON.stringify(data));
          };

          const url = new URL(req.url, `http://${req.headers.host}`);
          req.query = Object.fromEntries(url.searchParams);

          if (req.method === 'POST') {
             let body = '';
             req.on('data', chunk => body += chunk.toString());
             req.on('end', async () => {
                 try {
                     req.body = body ? JSON.parse(body) : {};
                     await handler(req, res);
                 } catch(e) {
                     res.status(500).json({error: e.message});
                 }
             });
          } else {
             await handler(req, res);
          }
          return;
        } catch (err) {
          console.error('API Error:', err);
          if (!res.headersSent) {
             res.statusCode = 500;
             res.setHeader('Content-Type', 'application/json');
             res.end(JSON.stringify({error: err.message}));
          }
          return;
        }
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd(), '')};
  return {
    plugins: [react(), tailwindcss(), apiMiddleware()]
  };
})
