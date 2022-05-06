import { NextComponentType } from "next"
import { useSession } from "next-auth/react"

export const Layout: NextComponentType = ({ children }) =>
{
    return (
        <>
            <div>
                 {/*{(data && status === "authenticated") ? <Navigation /> : null}*/}
                {children}
            </div>
        </>
    )
}