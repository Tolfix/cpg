import { Response } from "express";
import Logger from "@cpg/logger";

const logError = new Logger("cpg:api:response:error");
const logSuccess = new Logger("cpg:api:response:success");

export function APISuccess(msg: any, status = 200)
{
    return (res: Response) =>
    {
        const ip = res.req.headers['x-forwarded-for'] || res.req.socket.remoteAddress;
        const url = res.req.originalUrl;
        const method = res.req.method;
        logSuccess.info(`${ip} ${method}:(${status}) ${url}`);
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
        res.status(status).json(msg);
    }
}

export function APIError(msg: any, status = 400)
{
    return (res: Response) =>
    {
        const ip = res.req.headers['x-forwarded-for'] || res.req.socket.remoteAddress;
        const url = res.req.originalUrl;
        const method = res.req.method;
        logError.info(`${ip} ${method}:(${status}) ${url}`);
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
        res.status(status).json(msg);
    }
}