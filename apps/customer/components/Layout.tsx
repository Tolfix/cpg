import { NextComponentType } from "next"
import { useSession } from "next-auth/react"

/**
 * The Layout component is a function that returns a div with the children prop
 * @param  - NextComponentType = ({ children }) =>
 * @returns The children of the component.
 */
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