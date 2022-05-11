import { GetServerSidePropsContext, PreviewData } from "next";
import { getSession } from "next-auth/react";
import { ParsedUrlQuery } from "querystring";

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