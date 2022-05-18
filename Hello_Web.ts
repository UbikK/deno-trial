import { serve } from "https://deno.land/std@0.139.0/http/server.ts";

const handler = (req: Request): Response => {
    console.info('URL::', new URL(req.url));
    return new Response('Hello World')
}

const otherHandler = (req: Request): Response => {
    return new Response('Hola')
}

serve(handler)