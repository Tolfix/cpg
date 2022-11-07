import Logger from "@cpg/logger";

const log = new Logger("cpg:api:node:events");

process.on('exit', (code) =>
{
    log.error(`About to exit with code`, code);
});

process.on('unhandledRejection', (reason, promise) =>
{
    log.error('Unhandled Rejection at: ', promise, ' reason: ', reason);
});

process.on('uncaughtExceptionMonitor', (err: any, origin: any) =>
{
    log.error(`An error`, err, "at ", origin);
});