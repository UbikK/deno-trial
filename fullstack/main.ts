import { insert } from "./db/controller.ts";
import { Joke } from "./db/model.ts";
import { getManager, Logger as log } from "./deps.ts";
import { Application, Router } from "./deps.ts";

const app = new Application();
const router = new Router();
getManager().sync()
router.get("/test", (ctx) => {
  console.info("hey");
  ctx.response.body = "Hello world";
});

router.get("/random", async (ctx) => {
  const apiResponse: Response = await fetch('https://icanhazdadjoke.com/', {
      headers: new Headers({'Accept': 'application/json'}),
      method: 'GET'
  });
  const content: {id: string, joke: string, status: number} = await apiResponse.json();

  log.info(content);
  const all = await Joke.all();
  log.info(all)
  return ctx.response.body = JSON.stringify(content);
});

router.post("/", async (ctx) => {
  const content = await ctx.request.body().value;
    log.info(content)
  const dbReponse: Joke = await insert(content.joke);
  ctx.response.status = 200;
  ctx.response.body = `Inserted joke ${content} with id ${dbReponse.id}`;
});

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
await app.listen({ port: 8000, hostname: '127.0.0.1' });
