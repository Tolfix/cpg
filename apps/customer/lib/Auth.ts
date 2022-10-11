import { GetServerSidePropsContext, PreviewData } from "next";
import { getSession } from "next-auth/react";
import { ParsedUrlQuery } from "querystring";

/**
 * If the user is not logged in, redirect to the login page. If the user is logged in and their location is "/login",
 * redirect to the home page. Else return session.
 * @param {boolean} yes - boolean - If true, the user must be logged in. If false, the user must not be logged in.
 * @param context - GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
 * @returns The session object
 */
export async function mustAuth(

    yes: boolean,
    context: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
)
{
    const session = await getSession(context);
    // @ts-ignore
    const token = session?.user.email

    if (yes && !token)
    {
        context.res.writeHead(302, { Location: "/login" });
        context.res.end();
        return session;
    }

    if (token && context.resolvedUrl.includes("/login"))
    {
        context.res.writeHead(302, { Location: "/" });
        context.res.end();
        return session;
    }

    return session;
}