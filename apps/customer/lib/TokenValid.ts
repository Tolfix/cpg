
export default async (token: string, context: any) =>
{
    // Fetch the user from the API
    const res = await fetch(`${process.env.CPG_DOMAIN}/v2/customers/validate`,
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    if (res.status !== 200)
    {
        if (context)
        {
            // @ts-ignore
            context.res.writeHead(302, {
                Location: '/signout'
            });
            // @ts-ignore
            context.res.end();
        }
        return false;
    }

    return true;

}