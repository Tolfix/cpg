import { signOut } from "next-auth/react"

export default () =>
{
    signOut({
        callbackUrl: "/",
    });
    return (<></>)
}