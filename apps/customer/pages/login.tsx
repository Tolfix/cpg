import { GetServerSideProps } from "next";
import Login from "../components/Login";
import { ICompanyData } from "../interfaces/CompanyData";
import { mustAuth } from "../lib/Auth";

export default ({ company }: {
    company: ICompanyData;
}) => <Login company={company} />

/**
 * It checks if the user is logged in, and if they are, it returns an empty object
 * @param context - This is the context object that Next.js provides to all getServerSideProps functions. It contains the
 * request and response objects, as well as the query string parameters.
 * @returns The props object is being returned.
 */
export const getServerSideProps: GetServerSideProps = async (context) =>
{
    const session = await mustAuth(false, context);
    if (!session)
        return {
            props: {}
        };

    return {
        props: {

        }
    };

}