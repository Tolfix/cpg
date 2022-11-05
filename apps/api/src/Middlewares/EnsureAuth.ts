import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken";
import { JWT_Access_Token } from "../Config";
import { APIError } from "../Lib/Response";
import Logger from "@cpg/logger";

const log = new Logger("cpg:api:middleware:ensureauth");

export default function EnsureAuth(eR = false)
{
    return async (req: Request, res: Response, next?: NextFunction) =>
    {
        const authHeader = req.headers['authorization'];
        const tokenQuery = req.query.access_token;
        if (!authHeader && !tokenQuery)
            return eR ? Promise.resolve(false) : APIError({
                text: "Missing 'authorization' in header"
            })(res);

        let b64auth: string[];
        if (authHeader)
            b64auth = authHeader.split(' ');

        if (tokenQuery)
            b64auth = ["query", tokenQuery as string];

        // @ts-ignore
        if (!b64auth[0].toLocaleLowerCase().match(/query|bearer/g))
            return eR ? Promise.resolve(false) : APIError({
                text: "Missing 'basic' or 'bearer' in authorization"
            })(res);

        // @ts-ignore
        if (!b64auth[1])
            return eR ? Promise.resolve(false) : APIError({
                text: "Missing 'buffer' in authorization"
            })(res);

        // @ts-ignore
        if (b64auth[0].toLocaleLowerCase() === "bearer" || b64auth[0].toLocaleLowerCase() === "query")
        {
            // @ts-ignore
            const token = (Buffer.isBuffer(b64auth[1]) ? Buffer.from(b64auth[1], 'base64') : b64auth[1]).toString();

            try
            {
                const payload = jwt.verify(token, JWT_Access_Token, {
                    algorithms: ["HS256"],
                });

                if (!payload)
                    return eR ? Promise.resolve(false) : APIError(`Unauthorized user.`, 403)(res);

                // @ts-ignore
                if (!payload?.data?.id)
                    return eR ? Promise.resolve(false) : APIError(`Wrong payload.`, 403)(res);

                //@ts-ignore
                req.customer = payload.data;
                // @ts-ignore
                !eR ? log.info(`Authorizing`, payload.data) : null;

                return eR ? Promise.resolve(true) : next?.();
            }
            catch (e)
            {
                log.error(e);
                return eR ? Promise.resolve(false) : APIError(`JWT token expired or bad`, 403)(res);
            }

        }


    }
}