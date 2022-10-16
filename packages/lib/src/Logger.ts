import colors from "colors";
import { getTime } from "./Time";

/**
 * @deprecated
 * 
 * Use "@cpg/logger" instead
 * ```ts
 * import Logger from "@cpg/logger";
 * const logger = new Logger("name");
 * logger.info("Hello World");
 * ```
 */
const Logger = {
    trace: () =>
    {
        const err = new Error();
        const lines = err.stack?.split("\n");
        //@ts-ignore
        return lines[2].substring(lines[2].indexOf("("), lines[2].lastIndexOf(")") + 1)
    },

    debug: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.cyan(`debug: `), ...body)
    },

    api: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.green(`API: `), ...body)
    },

    graphql: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.magenta(`GraphQL: `), ...body)
    },


    plugin: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.green(`Plugin: `), ...body)
    },

    cache: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.magenta(`cach`) + colors.yellow("e: "), ...body)
    },

    rainbow: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.rainbow(`rainbow: `), ...body)
    },

    verbose: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | " + colors.magenta(`verbose: `), ...body)
    },

    error: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | ", colors.red(`error: `), ...body)
    },

    warning: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | ", colors.yellow(`warning: `), ...body)
    },

    info: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | ", colors.blue(`info: `), ...body)
    },

    db: <T extends any[]>(...body: T) =>
    {
        const time = getTime();
        console.log(time + " | ", colors.cyan(`data`) + colors.green("base: "), ...body)
    },
}

export default Logger;