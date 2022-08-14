import { Response } from "express";
import { Logger } from "lib";

export function APISuccess(msg: any, status = 200)
{
    return (res: Response) =>
    {
        const ip = res.req.headers['x-forwarded-for'] || res.req.socket.remoteAddress;
        const url = res.req.originalUrl;
        const method = res.req.method;
        Logger.api(`${ip} ${method}:(${status}) ${url}`);
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
        Logger.api(`${ip} ${method}:(${status}) ${url}`);
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count')
        res.status(status).json(msg);
    }
}