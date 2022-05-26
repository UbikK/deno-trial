import { Application, Router } from "https://deno.land/x/oak@v10.6.0/mod.ts";
import log from "./Logger.ts";
const app = new Application();
const router = new Router();

router.get('/test', (ctx) => {
    console.info('hey');
    ctx.response.body = 'Hello world';
})
app.use((ctx, next) => {
    log.info(ctx.request.url);
    next();
})

app.addEventListener("listen", ({ hostname, port, secure }) => {
    log.info(
      `Listening on: ${secure ? "https://" : "http://"}${
        hostname ??
          "localhost"
      }:${port}`,
    );
});

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8000 });

