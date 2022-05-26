import * as log from 'https://deno.land/std@0.140.0/log/mod.ts';



log.setup({
    handlers: {
        info: new log.handlers.ConsoleHandler('INFO', {formatter: (data) => data.toString()})
    },
    loggers: {
        default: {
            level: 'INFO',
            handlers: ['info']
        }
    }
})
const Logger = log.getLogger();
export {Logger};